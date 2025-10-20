# BrandVoice Testing Guide

## Quick Start

### 1. Manual Testing (Recommended for now)
```bash
# Start the development server
npm run dev

# Open http://localhost:8080 in your browser
# Follow the checklist in TESTING.md
```

### 2. Generate Test Report
```bash
# Generate a comprehensive test report
npm run test:report

# Generate test data JSON
npm run test:data
```

### 3. Automated Testing (Future)
```bash
# Run all tests
npm run test:all

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Scenarios

### Scenario 1: Fashion Brand
1. Fill in the form with:
   - Company: "EcoThreads"
   - Industry: "Fashion"
   - Tone: "Inspiring"
   - Target Audience: "Eco-conscious millennials"
   - Example posts about sustainability
   - Topic: "New organic cotton collection launch"

2. Click "Generate Content"
3. Verify all three platforms generate content
4. Check that content matches inspiring tone
5. Verify keywords appear in posts
6. Test copy functionality

### Scenario 2: Tech Startup
1. Fill in the form with:
   - Company: "DevTools AI"
   - Industry: "Tech"
   - Tone: "Professional"
   - Target Audience: "Software developers"
   - Example posts about AI and development
   - Topic: "AI-powered code review platform"

2. Click "Generate Content"
3. Verify professional tone in content
4. Check technical language usage
5. Verify CTA is included
6. Test brand voice scoring

### Scenario 3: Coffee Shop
1. Fill in the form with:
   - Company: "Daily Grind Cafe"
   - Industry: "Food"
   - Tone: "Casual"
   - Target Audience: "Local community"
   - Example posts about coffee and community
   - Topic: "Weekend special: new seasonal latte"

2. Click "Generate Content"
3. Verify casual, friendly tone
4. Check for emojis and hashtags
5. Verify local community focus
6. Test Instagram post length

## Key Test Points

### ✅ Must Work
- Form validation prevents empty submissions
- All three platforms generate content
- Brand voice scoring displays (60-100 range)
- Copy to clipboard works
- Reset button clears everything
- Loading states show progress
- Error handling works gracefully

### ✅ Should Work
- Responsive design on mobile/tablet
- Smooth animations and transitions
- Analytics dashboard shows metrics
- History sidebar loads previous generations
- Export functionality downloads JSON
- Platform regeneration works

### ✅ Nice to Have
- Advanced brand voice analysis
- Multiple language support
- Custom tone definitions
- Bulk content generation
- Advanced analytics

## Common Issues to Check

### White Screen Issues
- Check browser console for JavaScript errors
- Verify all imports are correct
- Check if Supabase connection is working
- Ensure all required environment variables are set

### Content Generation Issues
- Verify Supabase Edge Function is deployed
- Check API response format
- Ensure brand voice scoring calculation works
- Verify error handling for API failures

### UI/UX Issues
- Check responsive design on different screen sizes
- Verify all interactive elements work
- Check color contrast and accessibility
- Ensure smooth animations don't cause performance issues

## Performance Benchmarks

- Page load time: < 3 seconds
- Content generation: < 30 seconds
- Memory usage: Stable during extended use
- Animation frame rate: 60fps
- Bundle size: < 2MB

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Checklist

### Pre-Testing Setup
- [ ] Development server running
- [ ] Browser console open for error checking
- [ ] Test data prepared
- [ ] Different browsers available
- [ ] Mobile device available for responsive testing

### During Testing
- [ ] Test each scenario completely
- [ ] Check all interactive elements
- [ ] Verify error handling
- [ ] Test on different screen sizes
- [ ] Check performance metrics
- [ ] Document any issues found

### Post-Testing
- [ ] Document all issues found
- [ ] Prioritize fixes needed
- [ ] Update test scenarios if needed
- [ ] Plan regression testing
- [ ] Update documentation

## Troubleshooting

### Common Errors
1. **White screen on load**: Check console for JavaScript errors
2. **API errors**: Verify Supabase configuration
3. **Styling issues**: Check CSS imports and Tailwind configuration
4. **Performance issues**: Check for memory leaks or infinite loops

### Debug Tools
- Browser DevTools
- React DevTools
- Network tab for API calls
- Performance tab for metrics
- Console for error messages

## Continuous Testing

### Daily
- Run basic functionality tests
- Check for new errors in console
- Verify performance metrics

### Weekly
- Run full test suite
- Check cross-browser compatibility
- Review performance benchmarks

### Before Release
- Complete manual testing checklist
- Run automated tests
- Performance testing
- Security review
- Accessibility audit

---

**Need Help?**
- Check the main TESTING.md file for detailed checklists
- Review test scenarios in test-runner.js
- Check browser console for error messages
- Verify all dependencies are installed correctly
