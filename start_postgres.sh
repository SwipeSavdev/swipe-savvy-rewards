#!/bin/bash
# Start PostgreSQL and create databases

echo "🔧 Starting PostgreSQL..."
/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgresql@14 -k /tmp &
sleep 5

echo "📊 Creating databases..."
createdb swipesavvy_ai 2>/dev/null && echo "✅ swipesavvy_ai" || echo "⚠️ swipesavvy_ai (may exist)"
createdb swipesavvy_dev 2>/dev/null && echo "✅ swipesavvy_dev" || echo "⚠️ swipesavvy_dev (may exist)"
createdb swipesavvy_wallet 2>/dev/null && echo "✅ swipesavvy_wallet" || echo "⚠️ swipesavvy_wallet (may exist)"

echo ""
echo "📋 Listing databases:"
psql -l | grep swipesavvy

echo ""
echo "✅ PostgreSQL is ready!"
echo ""
echo "Connection strings:"
echo "  postgresql://localhost:5432/swipesavvy_ai"
echo "  postgresql://localhost:5432/swipesavvy_dev"
echo "  postgresql://localhost:5432/swipesavvy_wallet"
