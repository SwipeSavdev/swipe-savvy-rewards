#!/usr/bin/env python3
"""
Mock Data Management CLI

Interactive tool for managing mock data in the database.
"""

import sys
import argparse
import logging
from pathlib import Path
from app.utils.mock_data_loader import MockDataLoader

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def cmd_load(args):
    """Load mock data into database"""
    merchant_csv = args.merchant_file or "/Users/macbookpro/Documents/Mock Data/MerchantList-North.csv"
    
    # Verify file exists
    if not Path(merchant_csv).exists():
        logger.error(f"Merchant file not found: {merchant_csv}")
        return False
    
    loader = MockDataLoader()
    success = loader.load_mock_data(
        merchant_csv=merchant_csv,
        num_users=args.users,
        transactions_per_user=args.transactions,
        clear_existing=args.clear
    )
    
    if success:
        # Show statistics
        cmd_stats(args)
    
    return success


def cmd_clear(args):
    """Clear all mock data from database"""
    if not args.yes:
        response = input("⚠️  This will delete ALL transactions. Continue? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Cancelled")
            return True
    
    loader = MockDataLoader()
    try:
        loader.connect()
        loader.clear_transactions()
        loader.disconnect()
        logger.info("✅ All transactions cleared")
        return True
    except Exception as e:
        logger.error(f"Error clearing data: {str(e)}")
        return False


def cmd_stats(args):
    """Display mock data statistics"""
    loader = MockDataLoader()
    try:
        loader.connect()
        stats = loader.get_statistics()
        loader.disconnect()
        
        if not stats:
            logger.warning("No data in database")
            return False
        
        # Display statistics
        print("\n" + "=" * 60)
        print("📊 MOCK DATA STATISTICS")
        print("=" * 60)
        print(f"Total Transactions:  {stats.get('total_transactions', 0):>15,}")
        print(f"Unique Users:        {stats.get('unique_users', 0):>15,}")
        print(f"Unique Merchants:    {stats.get('unique_merchants', 0):>15,}")
        print(f"Total Volume:        ${stats.get('total_volume', 0):>14,.2f}")
        print(f"Date Range:          {stats.get('date_range', 'N/A'):>15}")
        
        print("\n📁 Transactions by Category:")
        print("-" * 60)
        
        for category, data in sorted(stats.get('by_category', {}).items()):
            pct = (data['count'] / stats.get('total_transactions', 1) * 100)
            print(f"  {category:15} {data['count']:>8,} transactions   ${data['total']:>12,.2f}  ({pct:>5.1f}%)")
        
        print("=" * 60 + "\n")
        return True
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return False


def cmd_validate(args):
    """Validate mock data integrity"""
    loader = MockDataLoader()
    try:
        loader.connect()
        cursor = loader.cursor
        
        print("\n" + "=" * 60)
        print("🔍 DATA VALIDATION")
        print("=" * 60)
        
        checks = []
        
        # Check 1: Duplicate transactions
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE transaction_id IS NULL")
        result = cursor.fetchone()[0]
        checks.append(("Null transaction IDs", result == 0, f"Found {result}" if result > 0 else "OK"))
        
        # Check 2: Null users
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id IS NULL")
        result = cursor.fetchone()[0]
        checks.append(("Null user IDs", result == 0, f"Found {result}" if result > 0 else "OK"))
        
        # Check 3: Invalid amounts
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE amount <= 0")
        result = cursor.fetchone()[0]
        checks.append(("Invalid amounts (<=0)", result == 0, f"Found {result}" if result > 0 else "OK"))
        
        # Check 4: Future dates
        cursor.execute("SELECT COUNT(*) FROM transactions WHERE transaction_date > NOW()")
        result = cursor.fetchone()[0]
        checks.append(("Future dates", result == 0, f"Found {result}" if result > 0 else "OK"))
        
        # Check 5: Category coverage
        cursor.execute("SELECT COUNT(DISTINCT category) FROM transactions")
        result = cursor.fetchone()[0]
        checks.append(("Categories present", result > 0, f"Found {result}" if result > 0 else "None"))
        
        # Display results
        for check_name, passed, message in checks:
            status = "✅" if passed else "❌"
            print(f"{status} {check_name:30} {message}")
        
        print("=" * 60 + "\n")
        
        loader.disconnect()
        return all(check[1] for check in checks)
        
    except Exception as e:
        logger.error(f"Error validating data: {str(e)}")
        return False


def cmd_reset(args):
    """Reset to default state (clear all, load default data)"""
    logger.info("🔄 Resetting mock data...")
    
    # Clear first
    args.yes = True  # Skip confirmation
    if not cmd_clear(args):
        return False
    
    # Load fresh data
    logger.info("📥 Loading default mock data...")
    args.users = 100
    args.transactions = 50
    args.clear = False
    
    return cmd_load(args)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Mock Data Management CLI for SwipeSavvy",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s load --users 100 --transactions 50
  %(prog)s load --clear  # Load with clearing existing data
  %(prog)s stats         # Show current statistics
  %(prog)s validate      # Check data integrity
  %(prog)s clear --yes   # Clear all data (no confirmation)
  %(prog)s reset         # Clear and reload default data
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Load command
    load_parser = subparsers.add_parser('load', help='Load mock data into database')
    load_parser.add_argument('--users', type=int, default=100, help='Number of mock users (default: 100)')
    load_parser.add_argument('--transactions', type=int, default=50, help='Transactions per user (default: 50)')
    load_parser.add_argument('--merchant-file', help='Path to merchant CSV file')
    load_parser.add_argument('--clear', action='store_true', help='Clear existing data first')
    load_parser.set_defaults(func=cmd_load)
    
    # Clear command
    clear_parser = subparsers.add_parser('clear', help='Clear all mock data')
    clear_parser.add_argument('--yes', '-y', action='store_true', help='Skip confirmation')
    clear_parser.set_defaults(func=cmd_clear)
    
    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show mock data statistics')
    stats_parser.set_defaults(func=cmd_stats)
    
    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate data integrity')
    validate_parser.set_defaults(func=cmd_validate)
    
    # Reset command
    reset_parser = subparsers.add_parser('reset', help='Reset to default state')
    reset_parser.set_defaults(func=cmd_reset)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    success = args.func(args)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
