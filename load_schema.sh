#!/bin/bash
# Load database schemas into all three databases

SCHEMA_FILE="/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/schema.sql"

echo "🗄️  Loading database schemas..."
echo ""

# Function to load schema into database
load_schema() {
    local db_name=$1
    echo "📍 Loading schema into '$db_name'..."
    
    psql -d "$db_name" -f "$SCHEMA_FILE" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Schema loaded successfully"
    else
        echo "   ❌ Error loading schema"
        return 1
    fi
}

# Load schemas into all three databases
load_schema "swipesavvy_dev"
load_schema "swipesavvy_ai"
load_schema "swipesavvy_wallet"

echo ""
echo "✅ All schemas loaded!"
echo ""

# Verify tables were created
echo "📋 Verifying tables in swipesavvy_dev:"
psql -d swipesavvy_dev -c "\dt" | head -20

echo ""
echo "📋 Verifying tables in swipesavvy_ai:"
psql -d swipesavvy_ai -c "\dt"

echo ""
echo "📋 Verifying tables in swipesavvy_wallet:"
psql -d swipesavvy_wallet -c "\dt"

echo ""
echo "✅ Database setup complete!"
