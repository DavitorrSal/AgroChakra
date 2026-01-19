#!/usr/bin/env python3
"""
Chatbot Setup Script
Helps integrate the chatbot into the existing agricultural analysis application
"""

import os
import shutil
import sys
from pathlib import Path

def backup_file(file_path):
    """Create a backup of an existing file"""
    if os.path.exists(file_path):
        backup_path = f"{file_path}.backup"
        shutil.copy2(file_path, backup_path)
        print(f"✅ Backed up {file_path} to {backup_path}")
        return True
    return False

def setup_backend():
    """Setup backend chatbot integration"""
    print("\n🔧 Setting up backend...")
    
    # Check if chatbot service exists
    chatbot_service_path = "backend/services/chatbot_service.py"
    if os.path.exists(chatbot_service_path):
        print(f"✅ Chatbot service found: {chatbot_service_path}")
    else:
        print(f"❌ Chatbot service not found: {chatbot_service_path}")
        return False
    
    # Backup and replace app.py
    app_path = "backend/app.py"
    app_with_chatbot_path = "backend/app_with_chatbot.py"
    
    if os.path.exists(app_with_chatbot_path):
        backup_file(app_path)
        shutil.copy2(app_with_chatbot_path, app_path)
        print(f"✅ Updated {app_path} with chatbot integration")
    else:
        print(f"❌ Enhanced app file not found: {app_with_chatbot_path}")
        return False
    
    return True

def setup_frontend():
    """Setup frontend chatbot integration"""
    print("\n🎨 Setting up frontend...")
    
    # Check required files
    required_files = [
        "frontend/css/chatbot.css",
        "frontend/js/chatbot_enhanced.js",
        "frontend/js/chatbot_integration.js"
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ Found: {file_path}")
        else:
            print(f"❌ Missing: {file_path}")
            return False
    
    # Backup and replace index.html
    index_path = "frontend/index.html"
    index_with_chatbot_path = "frontend/index_with_chatbot.html"
    
    if os.path.exists(index_with_chatbot_path):
        backup_file(index_path)
        shutil.copy2(index_with_chatbot_path, index_path)
        print(f"✅ Updated {index_path} with chatbot integration")
    else:
        print(f"❌ Enhanced HTML file not found: {index_with_chatbot_path}")
        return False
    
    return True

def verify_installation():
    """Verify that all components are properly installed"""
    print("\n🔍 Verifying installation...")
    
    # Check backend files
    backend_files = [
        "backend/app.py",
        "backend/services/chatbot_service.py"
    ]
    
    # Check frontend files
    frontend_files = [
        "frontend/index.html",
        "frontend/css/chatbot.css",
        "frontend/js/chatbot_enhanced.js",
        "frontend/js/chatbot_integration.js"
    ]
    
    all_files = backend_files + frontend_files
    missing_files = []
    
    for file_path in all_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️  Missing files: {len(missing_files)}")
        return False
    else:
        print(f"\n✅ All files present: {len(all_files)}")
        return True

def create_demo_page():
    """Create a demo page for testing the chatbot"""
    demo_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Demo - Agricultural Analysis</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/chatbot.css">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h3><i class="fas fa-robot me-2"></i>Agricultural Chatbot Demo</h3>
                    </div>
                    <div class="card-body">
                        <p>This is a demo page to test the agricultural chatbot functionality.</p>
                        
                        <div class="alert alert-info">
                            <h5>How to test:</h5>
                            <ol>
                                <li>Click the robot icon in the bottom-right corner</li>
                                <li>Use the demo controls (if visible)</li>
                                <li>Try asking questions about farm analysis</li>
                            </ol>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="startDemoConversation()">
                                <i class="fas fa-play me-2"></i>Start Demo Conversation
                            </button>
                            <button class="btn btn-info" onclick="demoChatbot()">
                                <i class="fas fa-database me-2"></i>Load Sample Data
                            </button>
                        </div>
                        
                        <div class="mt-4">
                            <h5>Sample Questions to Try:</h5>
                            <ul>
                                <li>"What does my LAI value mean?"</li>
                                <li>"Should I apply fertilizer?"</li>
                                <li>"How is the weather affecting my crops?"</li>
                                <li>"What are the best practices for soil management?"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="js/chatbot_enhanced.js"></script>
    <script src="js/chatbot_integration.js"></script>
    <script src="js/chatbot_demo.js"></script>
</body>
</html>"""
    
    demo_path = "frontend/chatbot_demo.html"
    with open(demo_path, 'w') as f:
        f.write(demo_content)
    
    print(f"✅ Created demo page: {demo_path}")

def main():
    """Main setup function"""
    print("🌱 Agricultural Chatbot Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("❌ Please run this script from the agricultural-analysis-game directory")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        print("❌ Installation verification failed")
        sys.exit(1)
    
    # Create demo page
    create_demo_page()
    
    print("\n🎉 Chatbot setup completed successfully!")
    print("\nNext steps:")
    print("1. Start your Flask server: python backend/app.py")
    print("2. Open frontend/index.html in your browser")
    print("3. Or test with frontend/chatbot_demo.html")
    print("4. Look for the robot icon in the bottom-right corner")
    print("\nFor detailed usage instructions, see CHATBOT_README.md")

if __name__ == "__main__":
    main()