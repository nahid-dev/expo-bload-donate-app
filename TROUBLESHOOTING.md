# Troubleshooting "Failed to download remote update" Error

## Common Solutions:

### 1. Clear Cache and Restart
```bash
npx expo start --clear
```

### 2. Check Network Connection
- Ensure your phone and computer are on the same Wi-Fi network
- Try using tunnel mode: `npx expo start --tunnel`
- Or use LAN mode: `npx expo start --lan`

### 3. Check Firewall
- Make sure Windows Firewall isn't blocking port 8081/8082
- Allow Node.js through firewall

### 4. Restart Metro Bundler
- Stop the server (Ctrl+C)
- Clear cache: `npx expo start --clear`
- Restart

### 5. Check Expo Go App
- Make sure you're using the latest version of Expo Go
- Try closing and reopening Expo Go
- Clear Expo Go cache (Settings > Clear Cache)

### 6. Use Tunnel Mode (if same network doesn't work)
```bash
npx expo start --tunnel
```

### 7. Check for Code Errors
- Look at the terminal for any bundling errors
- Check Metro bundler logs for specific errors

### 8. Alternative: Use Development Build
If Expo Go continues to have issues, consider creating a development build.

