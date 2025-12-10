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
        "name": "We Work Remotely",
        "base_url": "https://weworkremotely.com/remote-jobs.rss",
        "parser": "weworkremotely",
        "enabled": True,
    },
    {
        "name": "RemoteOK",
        "base_url": "https://remoteok.com/api",
        "parser": "remoteok",
        "enabled": True,
    },
    {
        "name": "Learning Guild",
        "base_url": "https://www.learningguild.com/jobs/",
        "parser": "learningguild",
        "enabled": True,
    },
]

# L&D Keywords for filtering (be specific to avoid false positives like "machine learning")
LD_KEYWORDS = [
    # Core L&D roles
    "instructional design",
    "instructional designer",
    "e-learning developer",
    "elearning developer",
    "elearning designer",
    "e-learning designer",
    "learning and development",
    "l&d manager",
    "l&d specialist",
    "l&d coordinator",
    # Training roles
    "corporate training",
    "training specialist",
    "training manager",
    "training coordinator",
    "training developer",
    "training facilitator",
    "technical trainer",
    "sales trainer",
    "customer trainer",
    "trainer role",
    # Learning design
    "learning experience designer",
    "learning designer",
    "learning experience",
    "lxd ",
    # Curriculum
    "curriculum developer",
    "curriculum development",
    "curriculum designer",
    "curriculum specialist",
    # Tools & Tech
    "articulate storyline",
    "articulate rise",
    "articulate 360",
    "adobe captivate",
    "captivate developer",
    "lms administrator",
    "lms manager",
    "learning management system",
    "scorm",
    "xapi",
    # Other L&D roles
    "talent development",
    "learning consultant",
    "course developer",
    "course designer",
    "content developer",
    "employee training",
    "corporate learning",
    "organizational learning",
    "onboarding specialist",
    "enablement specialist",
    "sales enablement",
    "customer education",
    "product trainer",
    "knowledge management",
    "training content",
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
