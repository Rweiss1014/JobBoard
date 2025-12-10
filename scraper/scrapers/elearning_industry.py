"""
Scraper for eLearning Industry job board
https://elearningindustry.com/jobs

This is a sample implementation - actual selectors would need to be
verified against the live site.
"""
from typing import List, Optional
from datetime import datetime
import re

from .base import BaseScraper
from models import (
    ScrapedJob,
    detect_location_type,
    detect_employment_type,
    detect_experience_level,
    detect_category,
)


class ELearningIndustryScraper(BaseScraper):
    """Scraper for eLearning Industry job board"""

    def __init__(self, zenrows_api_key: Optional[str] = None, scraperapi_key: Optional[str] = None):
        super().__init__(
            name="eLearning Industry",
            base_url="https://elearningindustry.com/jobs",
            zenrows_api_key=zenrows_api_key,
            scraperapi_key=scraperapi_key,
        )

    def get_job_listing_urls(self) -> List[str]:
        """
        Get URLs for individual job postings from the jobs listing page.
        """
        urls = []
        html = self.fetch_page(self.base_url)

        if not html:
            return urls

        soup = self.parse_html(html)

        # NOTE: These selectors are examples - would need to be adjusted
        # based on actual site structure
        job_links = soup.select("a.job-listing-link, .job-card a, article.job a")

        for link in job_links:
            href = link.get("href")
            if href:
                # Make absolute URL if relative
                if href.startswith("/"):
                    href = f"https://elearningindustry.com{href}"
                urls.append(href)

        return list(set(urls))  # Remove duplicates

    def parse_job_page(self, url: str, html: str) -> Optional[ScrapedJob]:
        """
        Parse a job posting page and extract job details.
        """
        soup = self.parse_html(html)

        try:
            # NOTE: These selectors are examples - would need to be adjusted
            title_elem = soup.select_one("h1.job-title, .job-header h1, h1")
            company_elem = soup.select_one(".company-name, .employer-name, .job-company")
            location_elem = soup.select_one(".job-location, .location, [class*='location']")
            description_elem = soup.select_one(".job-description, .job-content, article")

            if not title_elem or not description_elem:
                return None

            title = title_elem.get_text(strip=True)
            company = company_elem.get_text(strip=True) if company_elem else "Unknown Company"
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            description = description_elem.get_text(strip=True)

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
                description=description[:5000],  # Limit description length
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

        except Exception as e:
            print(f"Error parsing job page {url}: {e}")
            return None

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
