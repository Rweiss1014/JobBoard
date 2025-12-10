"""
Configuration for the L&D Exchange Job Scraper
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
ZENROWS_API_KEY = os.getenv("ZENROWS_API_KEY")
SCRAPERAPI_KEY = os.getenv("SCRAPERAPI_KEY")

# Firebase
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")

# Scraping Configuration
SCRAPE_INTERVAL_HOURS = 6  # How often to run the scraper
JOB_EXPIRY_DAYS = 30  # How long before jobs expire
MAX_JOBS_PER_SOURCE = 100  # Maximum jobs to scrape per source

# L&D Job Board Sources
# These are example URLs - in production, you'd scrape actual job boards
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
        "enabled": True,
    },
    {
        "name": "ATD Job Bank",
        "base_url": "https://jobs.td.org",
        "parser": "atd_jobs",
        "enabled": True,
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
