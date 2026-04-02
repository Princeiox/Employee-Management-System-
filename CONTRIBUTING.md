# Contributing to Perfect Systems

First off, thank you for considering contributing to Perfect Systems! It's people like you that make Perfect Systems such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what you expected**
* **Include screenshots if applicable**
* **Include your environment details** (OS, Python version, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how it would be used**

### Pull Requests

* Fill in the required template
* Follow the existing code style
* Include appropriate test cases
* Update documentation as needed
* End all files with a newline

## Development Setup

### Backend Development

1. Fork and clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the environment and install dependencies:
   ```bash
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Development

1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev -- --host
   ```

## Code Style

### Python (Backend)
* Follow PEP 8 guidelines
* Use type hints where possible
* Write descriptive docstrings for functions and classes
* Keep functions focused and concise

### JavaScript/React (Frontend)
* Use functional components with hooks
* Follow the existing component structure
* Use meaningful variable and function names
* Keep components focused on a single responsibility

## Testing

* Write tests for new features
* Ensure all tests pass before submitting a PR
* Aim for good test coverage

## Commit Messages

* Use clear and meaningful commit messages
* Start with a verb in the present tense (e.g., "Add", "Fix", "Update")
* Keep the first line under 50 characters
* Provide additional details in the commit body if needed

Example:
```
Add user profile update functionality

- Implement profile edit form
- Add API endpoint for profile updates
- Update user schema to include new fields
```

## Project Structure

Please familiarize yourself with the project structure documented in `PROJECT_STRUCTURE.md` before making contributions.

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for your contributions! 🎉
