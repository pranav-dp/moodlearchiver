# MoodleArchiver

**[🌐 Website](https://lmsarchiver.vercel.app)**

**Credits**: This project is a fork of [Aathish04's MoodleArchiver](https://github.com/Aathish04/moodlearchiver). Maintained by [Pranav](https://github.com/pranav-dp).

## What This Tool Does

MoodleArchiver is a web application that allows you to download all files from your Moodle courses in one go. Instead of clicking through endless folders and downloading files one by one, this tool connects to Moodle's API and packages everything into organized ZIP files.


## Key Features

### Enhanced User Interface
- **Modern Card-Based Design**: Clean, responsive course selection cards
- **Advanced Search**: Search courses by code, name, or section (e.g., "UCS2502", "Microprocessors", "Section B")
- **Dark/Light Theme Toggle**: Built-in theme switcher with system preference detection
- **Batch Selection**: Select all filtered courses or clear all selections with one click
- **Real-time Progress**: Visual progress bar during downloads

### Persistent Authentication
- **Long-lasting Sessions**: Login tokens persist for 90 days (vs. session-only in original)
- **Automatic Restoration**: Automatically restores your session when you return
- **Secure Storage**: Uses localStorage with proper expiry management
- **Session Management**: Shows remaining session time and easy logout

### Improved Download Experience
- **Smart Naming**: Downloads are named with course codes and dates when you downloaded them (e.g., `CSE101_MATH201_2024-11-01.zip`)
- **Better Organization**: Files organized by course and section within the ZIP
- **Progress Tracking**: Real-time download progress with percentage completion

### Performance Optimizations
- **Optimized Rendering**: Memoized components to prevent unnecessary re-renders
- **Efficient State Management**: Proper React state handling instead of force updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Supported Moodle Instances

- SSN College LMS
- SNU Chennai LMS  
- Most standard Moodle installations (use custom backend option)

## How to Use

1. **Login**: Enter your Moodle credentials and select your institution
2. **Search & Select**: Use the search bar to find courses, then select the ones you want
3. **Download**: Click download and wait for your organized ZIP file

Your login will be remembered for 90 days, so you won't need to re-enter credentials every time.

## Running Locally

```bash
git clone https://github.com/pranav-dp/moodlearchiver
cd moodlearchiver
npm install
npm start
```

## Building for Production

```bash
npm run build
npm run deploy  # for GitHub Pages deployment
```

## Technical Improvements Over Original

### Authentication System
- Added `AuthService` class for persistent authentication management
- Token storage with automatic expiry handling
- Session restoration on app reload

### UI/UX Enhancements
- Replaced dropdown multiselect with intuitive card-based selection
- Added comprehensive search functionality across course names and codes
- Implemented dark/light theme system with CSS custom properties
- Added loading states and better error handling

### Performance
- Memoized course card components to prevent unnecessary re-renders
- Replaced `forceUpdate()` calls with proper state management
- Optimized CSS with reduced backdrop filters and simplified animations

### Code Quality
- Modular architecture with separate service classes
- Better error handling and user feedback
- Improved component organization and reusability

## Technology Stack

- **Frontend**: React 18, Bootstrap 5, React Bootstrap
- **File Handling**: JSZip, FileSaver
- **Authentication**: Custom AuthService with localStorage
- **Styling**: CSS Custom Properties for theming

## Security

- No credentials stored on servers
- Tokens stored locally with automatic expiry
- Uses Moodle's official webservice API
- Session data cleared on logout

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Disclaimer

This project is not affiliated with Moodle. It uses Moodle's public webservice API for educational purposes.

## License

Same as the original project - see LICENSE file for details.
