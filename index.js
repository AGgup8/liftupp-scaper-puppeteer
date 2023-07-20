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

app.post("/liftupp", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath: "/usr/bin/google-chrome",
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://liftupp.examsoft.co.uk/qmul/", {
      timeout: 20000,
      waitUntil: "networkidle2",
    });

    await page.type("#username", username);
    await page.type("#password", password);

    await Promise.all([page.click("#loginButton"), page.waitForNavigation({
      waitUntil: 'networkidle2',  
    })]);

    const errorMsg = (await page.$("p.error")) || null;
    if (errorMsg) {
      throw new Error(1);
    }

    await page.goto("https://liftupp.examsoft.co.uk/qmul/portal/feedback", {
      timeout: 20000,
      waitUntil: "networkidle2",
    });
    await page.$eval("#sliderControls li:last-child a", (el) => {
      el.click();
    });
    await page.waitForSelector("table.feedback");
    await page.$eval("tr:nth-child(2)", (el) => {
      el.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.$eval("tr:nth-child(2)", (el) => {
      el.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.$eval("tr:nth-child(2)", (el) => {
      el.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const supragingivalPmprUltrasonic = await getSupragingivalPmprUltrasonic(
      page
    );

    const supragingivalPmprHand = await getSupragingivalPmprHand(page);

    const plaqueAndBleeding = await getPlaqueAndBleeding(page);

    const sixPointPocketChart = await getSixPointPocketChart(page);

    const rsd = await getRsd(page);

    const directRestorations = await getDirectRestorations(page);

    const extractions = await getExtractions(page);

    const extraCoronalRestorations = await getExtraCoronalRestorations(page);

    const remPros = await getRemPros(page);

    await page.waitForTimeout(500);

    res.json({
      success: true,
      data: [
        plaqueAndBleeding,
        supragingivalPmprUltrasonic,
        supragingivalPmprHand,
        rsd,
        sixPointPocketChart,
        directRestorations,
        extractions,
        extraCoronalRestorations,
        remPros,
      ],
    });
  } catch (e) {
    console.error(e);
    if (e.message == 1) {
      res.json({
        success: false,
        message:
          "Your username or password were incorrect. You are allowed 3 attempts within 5 minutes. After 10 failed attempts accounts are deactivated and your Liftupp administrator will need to re-activate your account.",
      });
    } else {
      res.json({
        success: false,
        message: "Something went wrong. Please try again or try again later.",
      });
    }
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}.`);
});

async function getSupragingivalPmprUltrasonic(page) {
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getSupragingivalPmprHand(page) {
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(4)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getPlaqueAndBleeding(page) {
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(3)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getSixPointPocketChart(page) {
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(5)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getRsd(page) {
  await page.$eval("ul.breadcrumb > li:nth-child(5)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(7)");
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getDirectRestorations(page) {
  await page.$eval("ul.breadcrumb > li:nth-child(5)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(3)");
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getExtractions(page) {
  await page.$eval("ul.breadcrumb > li:nth-child(5)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(8)");
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  return await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      return { date, time, rating, staff, difficulty };
    })
  );
}

async function getExtraCoronalRestorations(page) {
  // naivagate to extra-coronal restorations
  await page.$eval("ul.breadcrumb > li:nth-child(5)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(10)");
  await new Promise(r => setTimeout(r, 2000));

  // count fits
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  const extraCoronalFits = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const quad = el.querySelector("td.quad").innerHTML;
      const tooth = el.querySelector("td.tooth").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const material = el.querySelector("td.material").innerHTML;
      const type = "fit";
      return {
        date,
        time,
        rating,
        patient,
        quad,
        tooth,
        staff,
        difficulty,
        procedure,
        material,
        type,
      };
    })
  );
  await page.waitForTimeout(500);

  // count impressions
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(3)");
  await new Promise(r => setTimeout(r, 2000));
  const extraCoronalImps = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const quad = el.querySelector("td.quad").innerHTML;
      const tooth = el.querySelector("td.tooth").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const material = el.querySelector("td.material").innerHTML;
      const type = "impression";
      return {
        date,
        time,
        rating,
        patient,
        quad,
        tooth,
        staff,
        difficulty,
        procedure,
        material,
        type,
      };
    })
  );
  await page.waitForTimeout(500);

  // count preps
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(4)");
  await new Promise(r => setTimeout(r, 2000));
  const extraCoronalPreps = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const quad = el.querySelector("td.quad").innerHTML;
      const tooth = el.querySelector("td.tooth").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const material = el.querySelector("td.material").innerHTML;
      const type = "preparation";
      return {
        date,
        time,
        rating,
        patient,
        quad,
        tooth,
        staff,
        difficulty,
        procedure,
        material,
        type,
      };
    })
  );
  await page.waitForTimeout(500);

  // count temps
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(5)");
  await new Promise(r => setTimeout(r, 2000));
  const extraCoronalTemps = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const quad = el.querySelector("td.quad").innerHTML;
      const tooth = el.querySelector("td.tooth").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const material = el.querySelector("td.material").innerHTML;
      const type = "temporary";
      return {
        date,
        time,
        rating,
        patient,
        quad,
        tooth,
        staff,
        difficulty,
        procedure,
        material,
        type,
      };
    })
  );

  return [
    ...extraCoronalPreps,
    ...extraCoronalImps,
    ...extraCoronalTemps,
    ...extraCoronalFits,
  ];
}

async function getRemPros(page) {
  // navigate to removable pros
  await page.$eval("ul.breadcrumb > li:nth-child(5)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(9)");
  await new Promise(r => setTimeout(r, 2000));

  // count primary impressions
  await page.click("tr:nth-child(2)");
  await new Promise(r => setTimeout(r, 2000));
  const remProsPrimaryImps = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const type = "primary impression";
      return {
        date,
        time,
        rating,
        staff,
        patient,
        difficulty,
        procedure,
        type,
      };
    })
  );
  await page.waitForTimeout(500);

  // count secondary impressions
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(7)");
  await new Promise(r => setTimeout(r, 2000));
  const remProsSecondaryImps = await page.$$eval(
    "table.feedback > tr",
    (rows) =>
      rows.map((el) => {
        const date = el.querySelector("td.date").innerHTML;
        const time = el.querySelector("td.time").innerHTML;
        const rating = el.querySelector("td.rating").innerHTML;
        const patient = el.querySelector("td.patient").innerHTML;
        const staff = el.querySelector("td.user").innerHTML;
        const difficulty = el.querySelector("td.difficulty").innerHTML;
        const procedure = el.querySelector("td.procedure").innerHTML;
        const type = "secondary impression";
        return {
          date,
          time,
          rating,
          staff,
          patient,
          difficulty,
          procedure,
          type,
        };
      })
  );
  await page.waitForTimeout(500);

  // count jaw registrations
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(6)");
  await new Promise(r => setTimeout(r, 2000));
  const remProsJawRegistrations = await page.$$eval(
    "table.feedback > tr",
    (rows) =>
      rows.map((el) => {
        const date = el.querySelector("td.date").innerHTML;
        const time = el.querySelector("td.time").innerHTML;
        const rating = el.querySelector("td.rating").innerHTML;
        const patient = el.querySelector("td.patient").innerHTML;
        const staff = el.querySelector("td.user").innerHTML;
        const difficulty = el.querySelector("td.difficulty").innerHTML;
        const procedure = el.querySelector("td.procedure").innerHTML;
        const type = "jaw registration";
        return {
          date,
          time,
          rating,
          staff,
          patient,
          difficulty,
          procedure,
          type,
        };
      })
  );
  await page.waitForTimeout(500);

  // count try-ins
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(12)");
  await new Promise(r => setTimeout(r, 2000));
  const remProsTryIns = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const type = "try-in";
      return {
        date,
        time,
        rating,
        staff,
        patient,
        difficulty,
        procedure,
        type,
      };
    })
  );
  await page.waitForTimeout(500);

  // count fits
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(4)");
  await new Promise(r => setTimeout(r, 2000));
  const remProsFits = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const type = "fit";
      return {
        date,
        time,
        rating,
        staff,
        patient,
        difficulty,
        procedure,
        type,
      };
    })
  );
  await page.waitForTimeout(500);

  // count reviews
  await page.$eval("ul.breadcrumb > li:nth-child(7)", (el) => {
    el.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.click("tr:nth-child(5)");
  await new Promise(r => setTimeout(r, 2000));
  const remProsReviews = await page.$$eval("table.feedback > tr", (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const patient = el.querySelector("td.patient").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const type = "review";
      return {
        date,
        time,
        rating,
        staff,
        patient,
        difficulty,
        procedure,
        type,
      };
    })
  );

  return [
    ...remProsPrimaryImps,
    ...remProsSecondaryImps,
    ...remProsJawRegistrations,
    ...remProsTryIns,
    ...remProsFits,
    ...remProsReviews,
  ];
}
