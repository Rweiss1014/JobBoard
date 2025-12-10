"""
Scraper for We Work Remotely job board
https://weworkremotely.com/remote-jobs.rss

Uses RSS feed for reliable job data extraction.
Filters for L&D related positions.
"""
from typing import List, Optional
from datetime import datetime
import re
import logging

from .base import BaseScraper
from models import (
    ScrapedJob,
    detect_location_type,
    detect_employment_type,
    detect_experience_level,
    detect_category,
)
from config import LD_KEYWORDS

logger = logging.getLogger(__name__)


class WeWorkRemotelyScraper(BaseScraper):
    """Scraper for We Work Remotely using RSS feed"""

    def __init__(self, zenrows_api_key: Optional[str] = None, scraperapi_key: Optional[str] = None):
        super().__init__(
            name="We Work Remotely",
            base_url="https://weworkremotely.com/remote-jobs.rss",
            zenrows_api_key=zenrows_api_key,
            scraperapi_key=scraperapi_key,
        )
        self._rss_items = []

    def get_job_listing_urls(self) -> List[str]:
        """
        Fetch job listings from RSS feed.
        Filters for L&D related jobs based on keywords.
        """
        urls = []

        try:
            response = self.client.get(self.base_url)

            if response.status_code == 200:
                soup = self.parse_html(response.text)

                items = soup.find_all("item")
                logger.info(f"RSS feed returned {len(items)} total jobs")

                # Filter for L&D related jobs
                for item in items:
                    title_elem = item.find("title")
                    desc_elem = item.find("description")
                    link_elem = item.find("link")
                    category_elem = item.find("category")

                    if not title_elem or not link_elem:
                        continue

                    title = title_elem.get_text(strip=True)
                    description = desc_elem.get_text(strip=True) if desc_elem else ""
                    category = category_elem.get_text(strip=True) if category_elem else ""
                    url = link_elem.get_text(strip=True)

                    # Check if job is L&D related
                    text_to_check = f"{title} {description} {category}".lower()

                    if self._is_ld_related(text_to_check):
                        urls.append(url)
                        # Cache the item data for later parsing
                        self._cache_rss_item(url, item)

                logger.info(f"Filtered to {len(urls)} L&D related jobs")

            else:
                logger.error(f"RSS feed returned status {response.status_code}")

        except Exception as e:
            logger.error(f"Error fetching RSS feed: {e}")

        return urls

    def _is_ld_related(self, text: str) -> bool:
        """Check if the job is related to Learning & Development"""
        for keyword in LD_KEYWORDS:
            if keyword.lower() in text:
                return True
        return False

    def _cache_rss_item(self, url: str, item):
        """Cache RSS item data"""
        if not hasattr(self, "_rss_cache"):
            self._rss_cache = {}
        self._rss_cache[url] = item

    def _get_cached_item(self, url: str):
        """Get cached RSS item"""
        if not hasattr(self, "_rss_cache"):
            return None
        return self._rss_cache.get(url)

    def parse_job_page(self, url: str, html: str) -> Optional[ScrapedJob]:
        """
        Parse job from cached RSS data or fetched page.
        """
        try:
            # Try cached RSS data first
            item = self._get_cached_item(url)
            if item:
                return self._parse_from_rss(item, url)

            # Fall back to parsing HTML if needed
            if html:
                return self._parse_from_html(url, html)

            return None

        except Exception as e:
            logger.error(f"Error parsing job {url}: {e}")
            return None

    def _parse_from_rss(self, item, url: str) -> ScrapedJob:
        """Parse job from RSS item"""
        # Extract title (format: "Company: Job Title")
        title_elem = item.find("title")
        full_title = title_elem.get_text(strip=True) if title_elem else ""

        # Split company and title
        if ": " in full_title:
            company, title = full_title.split(": ", 1)
        else:
            company = "Unknown Company"
            title = full_title

        # Get description
        desc_elem = item.find("description")
        description = ""
        if desc_elem:
            # Description is HTML encoded, parse it
            desc_html = desc_elem.get_text()
            desc_soup = self.parse_html(desc_html)
            description = desc_soup.get_text(separator="\n", strip=True)

        # Get location/region
        region_elem = item.find("region")
        region = region_elem.get_text(strip=True) if region_elem else "Remote"

        # Get job type
        type_elem = item.find("type")
        job_type = type_elem.get_text(strip=True) if type_elem else "Full-Time"

        # Get publication date
        pub_date_elem = item.find("pubdate")
        posted_at = None
        if pub_date_elem:
            try:
                date_str = pub_date_elem.get_text(strip=True)
                posted_at = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
            except (ValueError, TypeError):
                pass

        # Detect attributes
        location_type = "remote"  # All WWR jobs are remote
        employment_type = detect_employment_type(title, f"{job_type} {description}")
        experience_level = detect_experience_level(title, description)
        category = detect_category(title, description)

        return ScrapedJob(
            title=title,
            company=company,
            location=region if region else "Remote",
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

    def _parse_from_html(self, url: str, html: str) -> Optional[ScrapedJob]:
        """Fallback HTML parsing"""
        soup = self.parse_html(html)

        title_elem = soup.select_one("h1, .listing-header-container h1")
        company_elem = soup.select_one(".company-card h2, .company-name")

        if not title_elem:
            return None

        title = title_elem.get_text(strip=True)
        company = company_elem.get_text(strip=True) if company_elem else "Unknown Company"

        description_elem = soup.select_one(".listing-container, .job-description")
        description = description_elem.get_text(strip=True) if description_elem else ""

        return ScrapedJob(
            title=title,
            company=company,
            location="Remote",
            description=description[:5000],
            source_url=url,
            source_site=self.name,
            location_type="remote",
            salary_min=None,
            salary_max=None,
            category=detect_category(title, description),
            experience_level=detect_experience_level(title, description),
            employment_type=detect_employment_type(title, description),
            scraped_at=datetime.utcnow(),
        )
