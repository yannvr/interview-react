Those are (sadly) real code examples found in the codebase.
They have been contributed by contractors

This is to highlight how much unecessary complexity can be created by:
- reinventing the wheel (using reducer internally within a page component while redux is available to handle it)
- coding a page with copy/paste (disregard for DRY). Visible by the renderInspector which keeps being cloned..
- leaving leftover copy code (like compose)
- delivering too fast (idenditified by large commits for small features, lots of code duplication, no e2e tests)
