"""
Scraper for RemoteOK job board.
Uses their JSON API which is publicly available.
"""
from typing import List, Optional
from datetime import datetime
import logging

from .base import BaseScraper
from models import (
    ScrapedJob,
    detect_employment_type,
    detect_experience_level,
    detect_category,
)
from config import LD_KEYWORDS

logger = logging.getLogger(__name__)


class RemoteOKScraper(BaseScraper):
    """Scraper for RemoteOK using their JSON API"""

    def __init__(self, zenrows_api_key: Optional[str] = None, scraperapi_key: Optional[str] = None):
        super().__init__(
            name="RemoteOK",
            base_url="https://remoteok.com/api",
            zenrows_api_key=zenrows_api_key,
            scraperapi_key=scraperapi_key,
        )
        self._jobs_cache = []

    def get_job_listing_urls(self) -> List[str]:
        """Fetch job listings from RemoteOK JSON API."""
        urls = []

        try:
            response = self.client.get(
                self.base_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )

            if response.status_code == 200:
                data = response.json()

                # First item is metadata, skip it
                jobs = data[1:] if len(data) > 1 else []
                logger.info(f"RemoteOK API returned {len(jobs)} total jobs")

                # Filter for L&D related jobs
                for job in jobs:
                    # Check various fields for L&D keywords
                    position = job.get("position", "").lower()
                    company = job.get("company", "").lower()
                    description = job.get("description", "").lower()
                    tags = " ".join(job.get("tags", [])).lower()

                    text_to_check = f"{position} {description} {tags}"

                    if self._is_ld_related(text_to_check):
                        url = job.get("url", "")
                        if url:
                            if not url.startswith("http"):
                                url = f"https://remoteok.com{url}"
                            urls.append(url)
                            self._jobs_cache.append(job)

                logger.info(f"Filtered to {len(urls)} L&D related jobs")

            else:
                logger.error(f"RemoteOK API returned status {response.status_code}")

        except Exception as e:
            logger.error(f"Error fetching RemoteOK API: {e}")

        return urls

    def _is_ld_related(self, text: str) -> bool:
        """Check if job is L&D related"""
        for keyword in LD_KEYWORDS:
            if keyword.lower() in text:
                return True
        return False

    def parse_job_page(self, url: str, html: str) -> Optional[ScrapedJob]:
        """Parse job from cached API data."""
        try:
            # Find matching cached job
            for job in self._jobs_cache:
                job_url = job.get("url", "")
                if not job_url.startswith("http"):
                    job_url = f"https://remoteok.com{job_url}"
                if job_url == url:
                    return self._parse_from_api(job, url)
            return None
        except Exception as e:
            logger.error(f"Error parsing job {url}: {e}")
            return None

    def _parse_from_api(self, job: dict, url: str) -> ScrapedJob:
        """Parse job from API response"""
        title = job.get("position", "Unknown Title")
        company = job.get("company", "Unknown Company")
        location = job.get("location", "Remote")

        # Get description (HTML)
        description = job.get("description", "")
        if description:
            soup = self.parse_html(description)
            description = soup.get_text(separator="\n", strip=True)

        # Get salary
        salary_min = job.get("salary_min")
        salary_max = job.get("salary_max")

        # Parse date
        posted_at = None
        date_str = job.get("date")
        if date_str:
            try:
                # Format: "2024-12-10T12:00:00+00:00"
                posted_at = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            except:
                pass

        employment_type = detect_employment_type(title, description)
        experience_level = detect_experience_level(title, description)
        category = detect_category(title, description)

        return ScrapedJob(
            title=title,
            company=company,
            location=location if location else "Remote",
            description=description[:5000],
            source_url=url,
            source_site=self.name,
            location_type="remote",  # All RemoteOK jobs are remote
            salary_min=salary_min,
            salary_max=salary_max,
            category=category,
            experience_level=experience_level,
            employment_type=employment_type,
            posted_at=posted_at,
            scraped_at=datetime.utcnow(),
        )
