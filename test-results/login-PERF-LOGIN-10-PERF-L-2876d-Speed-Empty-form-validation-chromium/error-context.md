# Page snapshot

```yaml
- generic [ref=e1]:
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - button "Trở lại" [ref=e4]:
      - img
      - text: Trở lại
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Đăng nhập
        - generic [ref=e10]: Nhập email của bạn bên dưới để đăng nhập vào tài khoản của bạn
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Email
          - textbox "Email" [active] [ref=e15]:
            - /placeholder: m@example.com
          - paragraph [ref=e16]: Invalid email address
        - generic [ref=e17]:
          - generic [ref=e18]: Mật khẩu
          - generic [ref=e19]:
            - textbox "••••••••" [ref=e20]
            - button [ref=e21]:
              - generic [ref=e22]:
                - img
              - generic [ref=e23]:
                - img
          - paragraph [ref=e24]: Password must be at least 6 characters long
        - button "Đăng nhập" [ref=e25]:
          - generic [ref=e26]: Đăng nhập
          - generic [ref=e27]:
            - img
  - alert [ref=e28]
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35]
```