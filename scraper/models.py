"""
Data models for scraped jobs
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
import hashlib


@dataclass
class ScrapedJob:
    """Represents a job scraped from an external source"""

    title: str
    company: str
    location: str
    description: str
    source_url: str
    source_site: str

    # Optional fields
    location_type: str = "remote"  # remote, hybrid, onsite
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    salary_period: str = "annual"  # annual, hourly
    requirements: List[str] = field(default_factory=list)
    category: str = "instructional-design"
    experience_level: str = "mid"  # entry, mid, senior, lead, director
    employment_type: str = "full-time"  # full-time, part-time, contract, freelance

    # Metadata
    posted_at: Optional[datetime] = None
    scraped_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def id(self) -> str:
        """Generate a unique ID based on source URL"""
        return hashlib.md5(self.source_url.encode()).hexdigest()

    def to_firestore_dict(self) -> dict:
        """Convert to Firestore document format"""
        expiry_date = datetime.utcnow()
        expiry_date = expiry_date.replace(day=expiry_date.day + 30)

        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "locationType": self.location_type,
            "description": self.description,
            "requirements": self.requirements,
            "salary": {
                "min": self.salary_min,
                "max": self.salary_max,
                "currency": self.salary_currency,
                "period": self.salary_period,
            } if self.salary_min or self.salary_max else None,
            "category": self.category,
            "experienceLevel": self.experience_level,
            "employmentType": self.employment_type,
            "sourceUrl": self.source_url,
            "sourceSite": self.source_site,
            "postedAt": self.posted_at or self.scraped_at,
            "expiresAt": expiry_date,
            "scrapedAt": self.scraped_at,
            "isFeatured": False,
            "isDirectPost": False,
            "status": "active",
        }


def detect_location_type(location: str, description: str) -> str:
    """Detect if job is remote, hybrid, or onsite based on text"""
    text = f"{location} {description}".lower()

    if "remote" in text or "work from home" in text or "wfh" in text:
        if "hybrid" in text:
            return "hybrid"
        return "remote"
    elif "hybrid" in text:
        return "hybrid"
    else:
        return "onsite"


def detect_employment_type(title: str, description: str) -> str:
    """Detect employment type from job text"""
    text = f"{title} {description}".lower()

    if "freelance" in text or "freelancer" in text:
        return "freelance"
    elif "contract" in text or "contractor" in text:
        return "contract"
    elif "part-time" in text or "part time" in text:
        return "part-time"
    else:
        return "full-time"


def detect_experience_level(title: str, description: str) -> str:
    """Detect experience level from job text"""
    text = f"{title} {description}".lower()

    if "director" in text or "vp " in text or "vice president" in text:
        return "director"
    elif "lead" in text or "principal" in text or "head of" in text:
        return "lead"
    elif "senior" in text or "sr." in text or "sr " in text:
        return "senior"
    elif "junior" in text or "jr." in text or "entry" in text or "associate" in text:
        return "entry"
    else:
        return "mid"


def detect_category(title: str, description: str) -> str:
    """Detect L&D category from job text"""
    from config import CATEGORY_KEYWORDS

    text = f"{title} {description}".lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                return category

    return "instructional-design"  # Default category
