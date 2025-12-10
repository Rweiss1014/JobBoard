"""
Scraper for eLearning Industry job board
https://elearningindustry.com/jobs/openings

Uses Algolia API to fetch job listings, then JSON-LD for job details.
"""
from typing import List, Optional
from datetime import datetime
import re
import json
import logging

from .base import BaseScraper
from models import (
    ScrapedJob,
    detect_location_type,
    detect_employment_type,
    detect_experience_level,
    detect_category,
)

logger = logging.getLogger(__name__)

# Algolia credentials (public, used by the site's frontend)
ALGOLIA_APP_ID = "6IW3YMQG5Z"
ALGOLIA_API_KEY = "c2bff7f60428532ee3d7ed5236e5dd91"
ALGOLIA_INDEX = "production__job"


class ELearningIndustryScraper(BaseScraper):
    """Scraper for eLearning Industry job board using Algolia API"""

    def __init__(self, zenrows_api_key: Optional[str] = None, scraperapi_key: Optional[str] = None):
        super().__init__(
            name="eLearning Industry",
            base_url="https://elearningindustry.com/jobs/openings",
            zenrows_api_key=zenrows_api_key,
            scraperapi_key=scraperapi_key,
        )

    def get_job_listing_urls(self) -> List[str]:
        """
        Fetch job listings from sitemap.
        Returns URLs for individual job pages, filtered to recent jobs only.
        """
        urls = []
        sitemap_url = "https://elearningindustry.com/job-sitemap.xml"

        # Only include jobs from the last 60 days
        cutoff_year = datetime.utcnow().year
        cutoff_month = datetime.utcnow().month - 2  # ~60 days back
        if cutoff_month <= 0:
            cutoff_month += 12
            cutoff_year -= 1

        try:
            # Fetch sitemap XML
            response = self.client.get(sitemap_url)

            if response.status_code == 200:
                soup = self.parse_html(response.text)

                # Find all URL entries in sitemap
                all_urls = []
                for loc in soup.find_all("loc"):
                    url = loc.get_text(strip=True)
                    if "/jobs/openings/" in url:
                        all_urls.append(url)

                logger.info(f"Sitemap returned {len(all_urls)} total job URLs")

                # Filter to only recent jobs (URLs contain dates like -aug-22-2025)
                recent_patterns = [
                    f"-{cutoff_year}",  # Current year
                    f"-{cutoff_year - 1}" if cutoff_month <= 2 else None,  # Previous year if we're early in the year
                ]
                recent_patterns = [p for p in recent_patterns if p]

                for url in all_urls:
                    url_lower = url.lower()
                    # Check if URL contains a recent year
                    if any(pattern in url_lower for pattern in recent_patterns):
                        urls.append(url)

                logger.info(f"Filtered to {len(urls)} recent job URLs (from {cutoff_year})")

                # Sort by URL to get most recent first
                urls.sort(reverse=True)

            else:
                logger.error(f"Sitemap returned status {response.status_code}")

        except Exception as e:
            logger.error(f"Error fetching sitemap: {e}")

        return urls

    def _cache_hit(self, hit: dict):
        """Cache Algolia hit data to avoid extra page fetches"""
        if not hasattr(self, "_hit_cache"):
            self._hit_cache = {}
        slug = hit.get("slug") or hit.get("objectID")
        if slug:
            self._hit_cache[slug] = hit

    def _get_cached_hit(self, url: str) -> Optional[dict]:
        """Get cached hit data for a URL"""
        if not hasattr(self, "_hit_cache"):
            return None
        # Extract slug from URL
        slug = url.split("/")[-1]
        return self._hit_cache.get(slug)

    def parse_job_page(self, url: str, html: str) -> Optional[ScrapedJob]:
        """
        Parse a job posting page.
        First tries cached Algolia data, then JSON-LD, then HTML fallback.
        """
        try:
            # Try cached Algolia data first (fastest)
            cached = self._get_cached_hit(url)
            if cached:
                return self._parse_from_algolia(cached, url)

            # Parse HTML if we had to fetch the page
            soup = self.parse_html(html)

            # Try to extract JSON-LD structured data (most reliable)
            job_data = self._extract_json_ld(soup)

            if job_data:
                return self._parse_from_json_ld(job_data, url)

            # Fallback to HTML parsing
            return self._parse_from_html(soup, url, html)

        except Exception as e:
            logger.error(f"Error parsing job page {url}: {e}")
            return None

    def _parse_from_algolia(self, hit: dict, url: str) -> ScrapedJob:
        """Parse job from Algolia hit data"""
        title = hit.get("title", "")
        company = hit.get("company_name", "") or hit.get("company", "Unknown Company")
        location = hit.get("location", "") or hit.get("city", "Remote")

        # Get description (may be HTML)
        description = hit.get("description", "") or hit.get("content", "")
        if "<" in description:
            desc_soup = self.parse_html(description)
            description = desc_soup.get_text(separator="\n", strip=True)

        # Detect attributes
        location_type = detect_location_type(location, description)
        employment_type_raw = hit.get("job_type", "") or hit.get("employment_type", "")
        employment_type = detect_employment_type(title, f"{employment_type_raw} {description}")
        experience_level = detect_experience_level(title, description)
        category = detect_category(title, description)

        # Parse posted date
        posted_at = None
        timestamp = hit.get("created_at") or hit.get("posted_at") or hit.get("date")
        if timestamp:
            try:
                if isinstance(timestamp, (int, float)):
                    posted_at = datetime.fromtimestamp(timestamp)
                else:
                    posted_at = datetime.fromisoformat(str(timestamp).replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass

        return ScrapedJob(
            title=title,
            company=company,
            location=location if location else "Remote",
            description=description[:5000],
            source_url=url,
            source_site=self.name,
            location_type=location_type,
            salary_min=None,
            salary_max=None,
            category=category,
            experience_level=experience_level,
            employment_type=employment_type,
            posted_at=posted_at,
            scraped_at=datetime.utcnow(),
        )

    def _extract_json_ld(self, soup) -> Optional[dict]:
        """Extract JSON-LD JobPosting data from script tags"""
        scripts = soup.select('script[type="application/ld+json"]')

        for script in scripts:
            try:
                data = json.loads(script.string)

                # Handle both single object and array formats
                if isinstance(data, list):
                    for item in data:
                        if item.get("@type") == "JobPosting":
                            return item
                elif data.get("@type") == "JobPosting":
                    return data

            except (json.JSONDecodeError, TypeError):
                continue

        return None

    def _parse_from_json_ld(self, data: dict, url: str) -> ScrapedJob:
        """Parse job from JSON-LD structured data"""
        title = data.get("title", "")

        # Extract company name
        org = data.get("hiringOrganization", {})
        company = org.get("name", "Unknown Company") if isinstance(org, dict) else "Unknown Company"

        # Extract location
        location_data = data.get("jobLocation", {})
        if isinstance(location_data, dict):
            address = location_data.get("address", {})
            if isinstance(address, dict):
                location = f"{address.get('addressLocality', '')}, {address.get('addressRegion', '')}, {address.get('addressCountry', '')}".strip(", ")
            elif isinstance(address, str):
                location = address
            else:
                location = "Remote"
        else:
            location = "Remote"

        # Get description
        description = data.get("description", "")
        # Clean HTML from description if present
        if "<" in description:
            desc_soup = self.parse_html(description)
            description = desc_soup.get_text(separator="\n", strip=True)

        # Extract salary if present
        salary_data = data.get("baseSalary", {})
        salary_min, salary_max = None, None
        if isinstance(salary_data, dict):
            value = salary_data.get("value", {})
            if isinstance(value, dict):
                salary_min = value.get("minValue")
                salary_max = value.get("maxValue")

        # Extract employment type
        employment_type_raw = data.get("employmentType", "")

        # Detect attributes
        location_type = detect_location_type(location, description)
        employment_type = detect_employment_type(title, f"{employment_type_raw} {description}")
        experience_level = detect_experience_level(title, description)
        category = detect_category(title, description)

        # Parse posted date
        posted_at = None
        date_posted = data.get("datePosted")
        if date_posted:
            try:
                posted_at = datetime.fromisoformat(date_posted.replace("Z", "+00:00"))
            except ValueError:
                pass

        return ScrapedJob(
            title=title,
            company=company,
            location=location if location else "Remote",
            description=description[:5000],
            source_url=url,
            source_site=self.name,
            location_type=location_type,
            salary_min=int(salary_min) if salary_min else None,
            salary_max=int(salary_max) if salary_max else None,
            category=category,
            experience_level=experience_level,
            employment_type=employment_type,
            posted_at=posted_at,
            scraped_at=datetime.utcnow(),
        )

    def _parse_from_html(self, soup, url: str, html: str) -> Optional[ScrapedJob]:
        """Fallback HTML parsing if JSON-LD not available"""
        # Try common selectors
        title_elem = soup.select_one("h1, .job-title, [class*='title']")
        description_elem = soup.select_one(".job-description, .job-content, article, main")

        if not title_elem:
            return None

        title = title_elem.get_text(strip=True)
        company = "Unknown Company"
        location = "Remote"
        description = description_elem.get_text(strip=True) if description_elem else ""

        # Extract salary if present
        salary_min, salary_max = self._extract_salary(html)

        # Detect job attributes from content
        location_type = detect_location_type(location, description)
        employment_type = detect_employment_type(title, description)
        experience_level = detect_experience_level(title, description)
        category = detect_category(title, description)

        return ScrapedJob(
            title=title,
            company=company,
            location=location,
            description=description[:5000],
            source_url=url,
            source_site=self.name,
            location_type=location_type,
            salary_min=salary_min,
            salary_max=salary_max,
            category=category,
            experience_level=experience_level,
            employment_type=employment_type,
            scraped_at=datetime.utcnow(),
        )

    def _extract_salary(self, html: str) -> tuple:
        """
        Extract salary range from job posting HTML.
        Returns (min, max) tuple.
        """
        # Common salary patterns
        patterns = [
            r"\$(\d{1,3}(?:,\d{3})*)\s*[-–to]+\s*\$(\d{1,3}(?:,\d{3})*)",  # $80,000 - $100,000
            r"(\d{1,3}(?:,\d{3})*)\s*[-–to]+\s*(\d{1,3}(?:,\d{3})*)\s*(?:per year|annually|/yr)",
            r"\$(\d{2,3})\s*[-–to]+\s*\$(\d{2,3})\s*(?:per hour|/hr|hourly)",  # $50 - $75/hr
        ]

        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                try:
                    min_val = int(match.group(1).replace(",", ""))
                    max_val = int(match.group(2).replace(",", ""))
                    return (min_val, max_val)
                except ValueError:
                    continue

        return (None, None)
