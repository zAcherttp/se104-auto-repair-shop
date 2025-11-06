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
          - textbox "Email" [ref=e15]:
            - /placeholder: m@example.com
            - text: test@example.com
        - generic [ref=e16]:
          - generic [ref=e17]: Mật khẩu
          - generic [ref=e18]:
            - textbox "••••••••" [active] [ref=e19]: "123"
            - button [ref=e20]:
              - generic [ref=e21]:
                - img
              - generic [ref=e22]:
                - img
          - paragraph [ref=e23]: Password must be at least 6 characters long
        - button "Đăng nhập" [ref=e24]:
          - generic [ref=e25]: Đăng nhập
          - generic [ref=e26]:
            - img
  - alert [ref=e27]
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
```