"""
Job board scrapers for L&D Exchange
"""
from .base import BaseScraper
from .elearning_industry import ELearningIndustryScraper
from .weworkremotely import WeWorkRemotelyScraper

__all__ = ["BaseScraper", "ELearningIndustryScraper", "WeWorkRemotelyScraper"]
