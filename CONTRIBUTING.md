# Contributing to Handwritten ✍️

Thank you for your interest in contributing to Handwritten! This project aims to create the most realistic digital handwriting experience. We welcome contributions of all kinds, from bug fixes and documentation improvements to new features and architectural suggestions.

---

## 🚀 Getting Started

1. **Fork and Clone**: Fork the repository on GitHub and clone your fork locally.
2. **Install Dependencies**:
    ```bash
    npm install
    ```
3. **Set Up Environment**:
   Copy `.env.example` to `.env` and configure your keys.
    ```env
    VITE_OPENROUTER_API_KEY=your_openrouter_api_key
    ```
    _Get a key at [OpenRouter.ai](https://openrouter.ai)_
4. **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 🛠️ Contribution Workflow

### 🌿 Branching Strategy

- **`main`**: Production-ready code.
- **Feature Branches**: Use descriptive names like `feat/high-fidelity-ink` or `fix/safari-alignment`.
- Always branch off from `main`.

### 💾 Commit Message Guidelines

We follow **Conventional Commits**. This helps us generate clean changelogs automatically.
Format: `<type>(<scope>): <subject>`

**Common Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests

### 🧪 Pull Request Process

1. **Lint and Format**: Run `npm run lint` before committing.
2. **Self-Review**: Look over your changes and remove any debugging code.
3. **Open PR**: Provide a detailed description of your changes, screenshots for UI modifications, and link any related issues.
4. **Review**: A maintainer will review your PR within 24-48 hours.

---

## 🎨 Coding Standards

- **TypeScript**: Ensure all new code is properly typed. Avoid `any`.
- **React**: Use functional components and hooks.
- **Tailwind CSS**: Use consistent spacing and color tokens.
- **Documentation**: Comment complex logic and update `README.md` if user-facing features change.

---

## 🗺️ Roadmap & Goals

- [x] Responsive Mobile Design
- [x] Pixel-Perfect PDF Export
- [x] Version 2.0: Atmospheric Update (Glows, 3D Depth)
- [ ] Custom Font Upload Support
- [ ] Multi-language Handwriting Support

---

## 🤝 Community & Support

Got questions? Want to discuss a feature before building it? Reach out!

- **GitHub**: [@bipin-vishwakarma](https://github.com/bipin-vishwakarma)
- **Repository**: [bipin-vishwakarma/text2handwriting.me](https://github.com/bipin-vishwakarma/text2handwriting.me)

---

## 📜 Legal & Conduct

By contributing to this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any security concerns following our [Security Policy](SECURITY.md).
