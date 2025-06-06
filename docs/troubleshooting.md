# Troubleshooting Guide

## Development Environment Issues

### Node.js Installation
- **Issue**: Node.js version conflicts
- **Solution**: Use Node.js version 18 or higher
- **Prevention**: Document required Node.js version in README

### Git Setup
- **Issue**: Git repository initialization
- **Solution**: Git repository automatically initialized with Next.js project
- **Prevention**: None needed - handled by create-next-app

## Project Setup Issues

### Next.js Development Server
- **Issue**: Turbopack vs Standard Server
- **Solution**: Using standard Next.js development server
- **Prevention**: Document server choice in code-decisions.md

## Common Problems and Solutions

### Server Connection Issues
- **Issue**: Can't connect to localhost:3000
- **Solution**: 
  1. Check if server is running
  2. Try different port (3001)
  3. Check firewall settings
- **Prevention**: Document server startup process

### Development Workflow
- **Issue**: Copy/paste in terminal
- **Solution**: 
  - Cmd: Right-click title bar → Edit → Mark
  - Git Bash: Right-click to paste
- **Prevention**: Document terminal usage in README 