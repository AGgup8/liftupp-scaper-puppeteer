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
    page.on("load", () => {
      const content = `
      *,
      *::after,
      *::before {
          transition-delay: 0s !important;
          transition-duration: 0s !important;
          animation-delay: -0.0001s !important;
          animation-duration: 0s !important;
          animation-play-state: paused !important;
          caret-color: transparent !important;
      }`;
  
      page.addStyleTag({ content });
    });
    await page.goto("https://liftupp.examsoft.co.uk/qmul/", {
      timeout: 20000,
      waitUntil: "networkidle2",
    });

    await page.type("#username", username);
    await page.type("#password", password);


    await Promise.all([
      page.click("#loginButton"),
      page.waitForNavigation({
        waitUntil: "networkidle2",
      }),
    ]);

    const errorMsg = (await page.$("p.error")) || null;
    if (errorMsg) {
      throw new Error(1);
    }

    await page.goto("https://liftupp.examsoft.co.uk/qmul/portal/feedback", {
      timeout: 20000,
      waitUntil: "networkidle2",
    });

    const [breadcrumb] = await getElementByX(
      "//*[@id='sliderControls']/li[last()]/a",
      page
    );
    await click(breadcrumb);
    await new Promise((r) => setTimeout(r, 1500));

    const [clinicalRow] = await getElementByX(
      '//td[contains(text(), "Clinical Skills")]/..',
      page
    );
    await click(clinicalRow);
    await new Promise((r) => setTimeout(r, 1500));

    const [adultRow] = await getElementByX(
      '//td[contains(text(), "Adult Dentistry")]/..',
      page
    );
    await click(adultRow);
    await new Promise((r) => setTimeout(r, 1500));

    const [perioRow] = await getElementByX(
      '//td[contains(text(), "Periodontics")]/..',
      page
    );
    click(perioRow);
    await new Promise((r) => setTimeout(r, 300));

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
        errorCode: 1,
      });
    } else {
      res.json({
        success: false,
        errorCode: 2,
      });
    }
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}.`);
});

async function click(element) {
  try {
    console.log("clicking element");
    await element.click();

    // repeat the click after 300ms incase it didn't work
    await new Promise((r) => setTimeout(r, 300));
    try {
      await element.click();
    } catch (error) {
      console.log('extra click not needed')
    }
  } catch (error) {
    console.log("failed clicking element so trying again");
    await new Promise((r) => setTimeout(r, 1500));
    await element.click();
  }
}

async function getElementByX(selector, page) {
  try {
    console.log("evaluating element by x");
    const element = await page.$x(selector);
    if (element.constructor === Array && element.length === 0) {
      throw new Error("element not found by x");
    }
    return element;
  } catch (error) {
    console.log("evaluation by x failed so trying again");
    await new Promise((r) => setTimeout(r, 1500));
    const element = await page.$x(selector);
    if (element.constructor === Array && element.length === 0) {
      throw new Error("element not found by x");
    }
    return element;
  }
}

async function evaluateTable(tableSelector, page, callback) {
  try {
    console.log("evaluating table");
    const table = await page.$$eval(tableSelector, callback);
    return table;
  } catch (error) {
    console.log("evaluation failed so trying again");
    await new Promise((r) => setTimeout(r, 1500));
    const table = await page.$$eval(tableSelector, callback);
    return table;
  }
}

async function getSupragingivalPmprUltrasonic(page) {
  const [ultrasonicPmprRow] = await getElementByX(
    '//td[contains(text(), "Supra Gingival Debridement (Ultrasonic)")]/..',
    page
  );
  await click(ultrasonicPmprRow);
  await new Promise((r) => setTimeout(r, 500));

  return evaluateTable("table.feedback > tr", page, (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));
  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [handPmprRow] = await getElementByX(
    '//td[contains(text(), "Supra Gingival Debridement (Hand)")]/..',
    page
  );
  await click(handPmprRow);
  await new Promise((r) => setTimeout(r, 500));

  return await evaluateTable("table.feedback > tr", page, (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));
  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [plaqueAndBleedingRow] = await getElementByX(
    '//td[contains(text(), "Plaque and Bleeding Index")]/..',
    page
  );
  await click(plaqueAndBleedingRow);
  await new Promise((r) => setTimeout(r, 500));

  return await evaluateTable("table.feedback > tr", page, (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));
  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [sixPointRow] = await getElementByX(
    '//td[contains(text(), "Comprehensive Periodontal Assessment (Loss of Attachment)")]/..',
    page
  );
  await click(sixPointRow);
  await new Promise((r) => setTimeout(r, 500));

  return await evaluateTable("table.feedback > tr", page, (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));
  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[5]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [rsdRow] = await getElementByX(
    '//td[contains(text(), "RSD")]/..',
    page
  );
  await click(rsdRow);
  await new Promise((r) => setTimeout(r, 300));

  const [rsdRowTwo] = await getElementByX(
    '//td[contains(text(), "RSD")]/..',
    page
  );
  await click(rsdRowTwo);
  await new Promise((r) => setTimeout(r, 500));

  return await evaluateTable("table.feedback > tr", page, (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));
  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[5]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [restorationsRow] = await getElementByX(
    '//td[contains(text(), "Direct Restorations")]/..',
    page
  );
  await click(restorationsRow);
  await new Promise((r) => setTimeout(r, 300));

  const [contourRow] = await getElementByX(
    '//td[contains(text(), "Appropriate restoration of tooth contour and anatomy")]/..',
    page
  );
  await click(contourRow);
  await new Promise((r) => setTimeout(r, 500));

  return await evaluateTable("table.feedback > tr", page, (rows) =>
    rows.map((el) => {
      const date = el.querySelector("td.date").innerHTML;
      const time = el.querySelector("td.time").innerHTML;
      const rating = el.querySelector("td.rating").innerHTML;
      const clinic = el.querySelector("td.clinic").innerHTML;
      const staff = el.querySelector("td.user").innerHTML;
      const quad = el.querySelector("td.quad").innerHTML;
      const tooth = el.querySelector("td.tooth").innerHTML;
      const difficulty = el.querySelector("td.difficulty").innerHTML;
      const procedure = el.querySelector("td.procedure").innerHTML;
      const material = el.querySelector("td.material").innerHTML;
      return { date, time, rating, clinic, staff, quad, tooth, difficulty, procedure, material };
    })
  );
}

async function getExtractions(page) {
  await new Promise((r) => setTimeout(r, 300));

  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[5]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [xlaRow] = await getElementByX(
    '//td[contains(text(), "Extractions")]/..',
    page
  );
  await click(xlaRow);
  await new Promise((r) => setTimeout(r, 300));

  const [toothMovementRow] = await getElementByX(
    '//td[contains(text(), "Appropriate Tooth Movement")]/..',
    page
  );
  await click(toothMovementRow);
  await new Promise((r) => setTimeout(r, 500));

  return await evaluateTable("table.feedback > tr", page, (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));

  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[5]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [extraCoronalRow] = await getElementByX(
    '//td[contains(text(), "Indirect Restorations")]/..',
    page
  );
  await click(extraCoronalRow);
  await new Promise((r) => setTimeout(r, 300));

  // count fits
  const [fitsRow] = await getElementByX(
    '//td[contains(text(), "Fit of Indirect restoration")]/..',
    page
  );
  await click(fitsRow);
  await new Promise((r) => setTimeout(r, 500));

  const extraCoronalFits = await evaluateTable("table.feedback > tr", page, (rows) =>
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

  // count impressions
  await new Promise((r) => setTimeout(r, 300));

  const [indirectBreadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(indirectBreadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [impsRow] = await getElementByX(
    '//td[contains(text(), "Impression taking")]/..',
    page
  );
  await click(impsRow);
  await new Promise((r) => setTimeout(r, 500));

  const extraCoronalImps = await evaluateTable("table.feedback > tr", page, (rows) =>
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

  // count preps
  await new Promise((r) => setTimeout(r, 300));

  const [indirectBreadcrumbTwo] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(indirectBreadcrumbTwo);
  await new Promise((r) => setTimeout(r, 300));

  const [prepsRow] = await getElementByX(
    '//td[contains(text(), "Appropriate Tooth Reduction")]/..',
    page
  );
  await click(prepsRow);
  await new Promise((r) => setTimeout(r, 500));

  const extraCoronalPreps = await evaluateTable("table.feedback > tr", page, (rows) =>
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

  // count temps
  await new Promise((r) => setTimeout(r, 300));

  const [indirectBreadcrumbThree] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(indirectBreadcrumbThree);
  await new Promise((r) => setTimeout(r, 300));

  const [tempsRow] = await getElementByX(
    '//td[contains(text(), "Construction and fit of provisional restoration")]/..',
    page
  );
  await click(tempsRow);
  await new Promise((r) => setTimeout(r, 500));

  const extraCoronalTemps = await evaluateTable(
    "table.feedback > tr",
    page,
    (rows) =>
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
  await new Promise((r) => setTimeout(r, 300));

  const [breadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[5]",
    page
  );
  await click(breadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [prosRow] = await getElementByX(
    '//td[contains(text(), "Pros")]/..',
    page
  );
  await click(prosRow);
  await new Promise((r) => setTimeout(r, 300));

  // count primary impressions
  const [primaryImpRow] = await getElementByX(
    '//td[contains(text(), "Impression taking (1st imps)")]/..',
    page
  );
  await click(primaryImpRow);
  await new Promise((r) => setTimeout(r, 500));

  const remProsPrimaryImps = await evaluateTable(
    "table.feedback > tr",
    page,
    (rows) =>
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

  // count secondary impressions
  await new Promise((r) => setTimeout(r, 300));

  const [remProsBreadcrumb] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(remProsBreadcrumb);
  await new Promise((r) => setTimeout(r, 300));

  const [secondaryImpRow] = await getElementByX(
    '//td[contains(text(), "Impression taking (2nd imps)")]/..',
    page
  );
  await click(secondaryImpRow);
  await new Promise((r) => setTimeout(r, 500));

  const remProsSecondaryImps = await evaluateTable(
    "table.feedback > tr",
    page,
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

  // count jaw registrations
  await new Promise((r) => setTimeout(r, 300));

  const [remProsBreadcrumbTwo] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(remProsBreadcrumbTwo);
  await new Promise((r) => setTimeout(r, 300));

  const [jawRegRow] = await getElementByX(
    '//td[contains(text(), "Ability to perform a Registration")]/..',
    page
  );
  await click(jawRegRow);
  await new Promise((r) => setTimeout(r, 500));

  const remProsJawRegistrations = await evaluateTable(
    "table.feedback > tr",
    page,
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

  // count try-ins
  await new Promise((r) => setTimeout(r, 300));

  const [remProsBreadcrumbThree] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(remProsBreadcrumbThree);
  await new Promise((r) => setTimeout(r, 300));

  const [tryinRow] = await getElementByX(
    '//td[contains(text(), "Try in teeth")]/..',
    page
  );
  await click(tryinRow);
  await new Promise((r) => setTimeout(r, 500));

  const remProsTryIns = await evaluateTable(
    "table.feedback > tr",
    page,
    (rows) =>
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

  // count fits
  await new Promise((r) => setTimeout(r, 300));

  const [remProsBreadcrumbFour] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(remProsBreadcrumbFour);
  await new Promise((r) => setTimeout(r, 300));

  const [fitsRow] = await getElementByX('//td[. = "Fit"]', page);
  await click(fitsRow);
  await new Promise((r) => setTimeout(r, 500));

  const remProsFits = await evaluateTable("table.feedback > tr", page, (rows) =>
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

  // count reviews
  await new Promise((r) => setTimeout(r, 300));

  const [remProsBreadcrumbFive] = await getElementByX(
    "//ul[@class='breadcrumb']/li[7]",
    page
  );
  await click(remProsBreadcrumbFive);
  await new Promise((r) => setTimeout(r, 300));

  const [reviewsRow] = await getElementByX(
    '//td[contains(text(), "Management complications at Review")]/..',
    page
  );
  await click(reviewsRow);
  await new Promise((r) => setTimeout(r, 500));

  const remProsReviews = await evaluateTable(
    "table.feedback > tr",
    page,
    (rows) =>
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
