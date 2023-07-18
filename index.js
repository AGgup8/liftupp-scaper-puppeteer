const puppeteer = require("puppeteer");
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

require("dotenv").config();

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Puppeteer server is running");
});

app.get("/liftupp", async (req, res) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote"
    ],
    headless: "new",
    executablePath:
      process.env.NODE_ENV === "production"
        ? PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto("https://developer.chrome.com/");

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    await page.type(".search-box__input", "automate beyond recorder");

    // Wait and click on first result
    const searchResultSelector = ".search-box__link";
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
      "text/Customize and automate"
    );
    const fullTitle = await textSelector?.evaluate((el) => el.textContent);

    // Print the full title
    console.log('The title of this blog post is "%s".', fullTitle);
    res.send(fullTitle);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong whilst running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}.`);
});
