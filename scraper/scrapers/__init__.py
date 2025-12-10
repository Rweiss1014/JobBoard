"""
Job board scrapers for L&D Exchange
"""
from .base import BaseScraper
from .elearning_industry import ELearningIndustryScraper
from .weworkremotely import WeWorkRemotelyScraper
from .remoteok import RemoteOKScraper
from .learningguild import LearningGuildScraper

__all__ = [
    "BaseScraper",
    "ELearningIndustryScraper",
    "WeWorkRemotelyScraper",
    "RemoteOKScraper",
    "LearningGuildScraper",
]
