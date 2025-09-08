from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Arrange: Go to the login page and log in.
    page.goto("http://localhost:3001/login")
    page.get_by_label("Email").fill("admin@example.com")
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to complete
    page.wait_for_url("http://localhost:3001/admin")

    # 2. Act: Navigate to the open positions page and create a new position.
    page.goto("http://localhost:3001/admin/open-positions")

    # Click the "Crear Posición" button to open the form
    page.get_by_role("button", name="Crear Posición").click()

    # Fill out the form
    # For v-select, we need to click to open the dropdown and then click the option
    page.get_by_label("Área de la Posición").click()
    page.get_by_text("Test Area").click()

    page.get_by_label("Departamento").click()
    page.get_by_text("Test Department").click()

    page.get_by_label("Posición").click()
    page.get_by_text("Test Position").click()

    page.get_by_label("Salario Mínimo").fill("50000")
    page.get_by_label("Salario Máximo").fill("70000")
    page.get_by_label("Requisitos y Calificaciones").fill("This is a test position.")

    page.get_by_label("Estado").click()
    page.get_by_text("open").click()

    page.get_by_label("Tipo de Publicación").click()
    page.get_by_text("Informal (Optimizado para WhatsApp)").click()


    # Submit the form
    page.get_by_role("button", name="Save").click()

    # 3. Assert: Confirm the new position is in the list.
    expect(page.get_by_text("Test Position")).to_be_visible()
    expect(page.get_by_text("Test Department")).to_be_visible()
    expect(page.get_by_text("Salario: $50000 - $70000")).to_be_visible()


    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
