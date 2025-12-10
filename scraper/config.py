"""
Configuration for the L&D Exchange Job Scraper
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env.local from parent directory (ld-exchange root)
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(env_path)

# API Keys
ZENROWS_API_KEY = os.getenv("ZENROWS_API_KEY")
SCRAPERAPI_KEY = os.getenv("SCRAPERAPI_KEY")

# Firebase - use JSON string from env var or fall back to file
FIREBASE_SERVICE_ACCOUNT_KEY = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")

# Scraping Configuration
SCRAPE_INTERVAL_HOURS = 6  # How often to run the scraper
JOB_EXPIRY_DAYS = 30  # How long before jobs expire
MAX_JOBS_PER_SOURCE = 100  # Maximum jobs to scrape per source

# L&D Job Board Sources
JOB_SOURCES = [
    {
        "name": "eLearning Industry",
        "base_url": "https://elearningindustry.com/jobs",
        "parser": "elearning_industry",
        "enabled": True,
    },
    {
        "name": "Training Industry",
        "base_url": "https://trainingindustry.com/jobs",
        "parser": "training_industry",
        "enabled": False,  # Not yet implemented
    },
    {
        "name": "ATD Job Bank",
        "base_url": "https://jobs.td.org",
        "parser": "atd_jobs",
        "enabled": False,  # Not yet implemented
    },
]

# L&D Keywords for filtering
LD_KEYWORDS = [
    "instructional design",
    "instructional designer",
    "e-learning",
    "elearning",
    "learning and development",
    "l&d",
    "corporate training",
    "training specialist",
    "training manager",
    "learning experience",
    "curriculum developer",
    "curriculum development",
    "articulate storyline",
    "articulate rise",
    "adobe captivate",
    "lms administrator",
    "learning management",
    "talent development",
    "training facilitator",
    "learning consultant",
]

# Category mapping based on job title/description keywords
CATEGORY_KEYWORDS = {
    "instructional-design": [
        "instructional design",
        "instructional designer",
        "learning design",
        "learning designer",
        "id specialist",
    ],
    "elearning-development": [
        "e-learning developer",
        "elearning developer",
        "course developer",
        "articulate",
        "captivate",
        "storyline",
        "rise 360",
    ],
    "training-facilitation": [
        "training facilitator",
        "trainer",
        "facilitator",
        "workshop",
        "classroom training",
    ],
    "learning-management": [
        "lms",
        "learning management",
        "cornerstone",
        "workday learning",
        "docebo",
        "saba",
    ],
    "curriculum-development": [
        "curriculum",
        "course design",
        "program design",
        "learning program",
    ],
    "corporate-training": [
        "corporate training",
        "enterprise training",
        "organizational learning",
        "employee training",
    ],
    "learning-technology": [
        "learning technology",
        "edtech",
        "learning platform",
        "xapi",
        "scorm",
    ],
    "talent-development": [
        "talent development",
        "talent management",
        "leadership development",
        "organizational development",
    ],
}
