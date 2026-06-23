# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - link "← Back" [ref=e5] [cursor=pointer]:
      - /url: /
    - main "Welcome Back" [ref=e6]:
      - generic [ref=e7]:
        - heading "Welcome Back" [level=1] [ref=e8]
        - paragraph [ref=e9]: Sign in to manage your business
      - generic [ref=e10]:
        - generic [ref=e11]:
          - text: Email Address
          - textbox "you@example.com" [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e15]: Password
          - textbox "Password" [ref=e17]:
            - /placeholder: Enter your password
          - generic [ref=e18]:
            - checkbox "Show password" [ref=e19]
            - generic [ref=e20]: Show password
        - button "Sign In" [ref=e21] [cursor=pointer]
        - paragraph [ref=e23]:
          - text: Don’t have an account?
          - link "Create Account" [ref=e24] [cursor=pointer]:
            - /url: /register
      - paragraph [ref=e25]: By signing in, you agree to our Terms & Privacy Policy
  - region "Notifications Alt+T"
```