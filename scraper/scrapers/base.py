"""
Base scraper class for L&D job boards
"""
from abc import ABC, abstractmethod
from typing import List, Optional
import httpx
from bs4 import BeautifulSoup
import logging

from models import ScrapedJob

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Abstract base class for job board scrapers"""

    def __init__(
        self,
        name: str,
        base_url: str,
        zenrows_api_key: Optional[str] = None,
        scraperapi_key: Optional[str] = None,
    ):
        self.name = name
        self.base_url = base_url
        self.zenrows_api_key = zenrows_api_key
        self.scraperapi_key = scraperapi_key
        self.client = httpx.Client(timeout=30.0)

    def fetch_page(self, url: str) -> Optional[str]:
        """
        Fetch a page using either ZenRows, ScraperAPI, or direct request.
        Falls back through options if one fails.
        """
        # Try ZenRows first
        if self.zenrows_api_key:
            try:
                response = self.client.get(
                    "https://api.zenrows.com/v1/",
                    params={
                        "url": url,
                        "apikey": self.zenrows_api_key,
                        "js_render": "true",
                    },
                )
                if response.status_code == 200:
                    logger.info(f"Successfully fetched {url} via ZenRows")
                    return response.text
            except Exception as e:
                logger.warning(f"ZenRows failed for {url}: {e}")

        # Try ScraperAPI
        if self.scraperapi_key:
            try:
                response = self.client.get(
                    f"http://api.scraperapi.com?api_key={self.scraperapi_key}&url={url}"
                )
                if response.status_code == 200:
                    logger.info(f"Successfully fetched {url} via ScraperAPI")
                    return response.text
            except Exception as e:
                logger.warning(f"ScraperAPI failed for {url}: {e}")

        # Direct request fallback
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = self.client.get(url, headers=headers)
            if response.status_code == 200:
                logger.info(f"Successfully fetched {url} directly")
                return response.text
        except Exception as e:
            logger.error(f"Direct request failed for {url}: {e}")

        return None

    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content using BeautifulSoup"""
        return BeautifulSoup(html, "lxml")

    @abstractmethod
    def get_job_listing_urls(self) -> List[str]:
        """Get list of URLs for individual job postings"""
        pass

    @abstractmethod
    def parse_job_page(self, url: str, html: str) -> Optional[ScrapedJob]:
        """Parse a job posting page and return a ScrapedJob"""
        pass

    def scrape(self, max_jobs: int = 100) -> List[ScrapedJob]:
        """
        Main scraping method. Gets job URLs and parses each one.
        """
        jobs = []
        logger.info(f"Starting scrape for {self.name}")

        try:
            job_urls = self.get_job_listing_urls()
            logger.info(f"Found {len(job_urls)} job URLs from {self.name}")

            for url in job_urls[:max_jobs]:
                html = self.fetch_page(url)
                if html:
                    job = self.parse_job_page(url, html)
                    if job:
                        jobs.append(job)
                        logger.info(f"Scraped: {job.title} at {job.company}")

        except Exception as e:
            logger.error(f"Error scraping {self.name}: {e}")

        logger.info(f"Completed scrape for {self.name}: {len(jobs)} jobs")
        return jobs

    def close(self):
        """Clean up resources"""
        self.client.close()
