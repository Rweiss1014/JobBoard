"""
Scraper for The Learning Guild job board.
This is an L&D-specific job board with better content.
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

logger = logging.getLogger(__name__)


class LearningGuildScraper(BaseScraper):
    """Scraper for The Learning Guild job board"""

    def __init__(self, zenrows_api_key: Optional[str] = None, scraperapi_key: Optional[str] = None):
        super().__init__(
            name="Learning Guild",
            base_url="https://www.learningguild.com/jobs/",
            zenrows_api_key=zenrows_api_key,
            scraperapi_key=scraperapi_key,
        )
        self._job_data_cache = {}

    def get_job_listing_urls(self) -> List[str]:
        """Fetch job listings from Learning Guild."""
        urls = []

        try:
            html = self.fetch_page(self.base_url)
            if not html:
                return urls

            soup = self.parse_html(html)

            # Find job listing links - they typically have a specific pattern
            job_links = soup.select('a[href*="/jobs/"]')

            for link in job_links:
                href = link.get("href", "")
                # Skip non-job links
                if not href or "/jobs/" not in href or href == "/jobs/":
                    continue

                # Make absolute URL
                if href.startswith("/"):
                    href = f"https://www.learningguild.com{href}"

                if href not in urls and "learningguild.com/jobs/" in href:
                    urls.append(href)

            logger.info(f"Found {len(urls)} job URLs from Learning Guild")

        except Exception as e:
            logger.error(f"Error fetching Learning Guild: {e}")

        return urls

    def parse_job_page(self, url: str, html: str) -> Optional[ScrapedJob]:
        """Parse a job posting page."""
        try:
            if not html:
                return None

            soup = self.parse_html(html)

            # Find title
            title_elem = soup.select_one("h1, .job-title, .posting-title")
            if not title_elem:
                return None

            title = title_elem.get_text(strip=True)

            # Find company
            company_elem = soup.select_one(".company-name, .employer, [class*='company']")
            company = company_elem.get_text(strip=True) if company_elem else "Unknown Company"

            # Find location
            location_elem = soup.select_one(".location, [class*='location']")
            location = location_elem.get_text(strip=True) if location_elem else "United States"

            # Find description
            desc_elem = soup.select_one(".job-description, .description, article, .content")
            description = desc_elem.get_text(separator="\n", strip=True) if desc_elem else ""

            location_type = detect_location_type(title, description, location)
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
                salary_min=None,
                salary_max=None,
                category=category,
                experience_level=experience_level,
                employment_type=employment_type,
                scraped_at=datetime.utcnow(),
            )

        except Exception as e:
            logger.error(f"Error parsing job {url}: {e}")
            return None
