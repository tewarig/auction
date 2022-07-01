// For a real auction, set this to false
let demoAuction = false;
// For a real auction, populate these arrays
let primaryImages = [
  "https://picsum.photos/200/300",
  "https://picsum.photos/200/300",
  "https://picsum.photos/200/300",
];
let titles = ["meow1", "meoq2", "emwo3"];
let subtitles = ["meow ", "emo", "meowoww"];
let details = ["111", "!11", "!1111"];
let secondaryImages = [
  "https://picsum.photos/200/300",
  "https://picsum.photos/200/300",
  "https://picsum.photos/200/300",
];
let startingPrices = [55, 60, 20];
let endTimes = [
  "Sun, 2 July 2022 23:59:15 GMT",
  "Sun, 2 July 2022 23:59:15 GMT",
  "Sun, 2 July 2022 23:59:15 GMT",
]; // Make sure to fix these to UTC time so they don't change with the users timezone

// Initial state of auction, used for resetting database
let startPrices = [];
for (let i = 0; i < startingPrices.length; i++) {
  if (demoAuction) {
    let now = new Date();
    let endTime = new Date().setHours(8 + i, 0, 0, 0);
    if (endTime - now < 0) {
      endTime = new Date(endTime).setDate(now.getDate() + 1);
    }
    endTimes.push(endTime);
  }
  startPrices.push({
    bid0: {
      bidder: String(i),
      amount: startingPrices[i],
      time: Date().substring(0, 24),
    },
  });
}
if (localStorage.getItem("liveRef")) {
} else {
  localStorage.setItem("liveRef", []);
}
// Convert time to string for HTML clocks
function timeBetween(start, end) {
  let _string = "";
  let secsRemaining = (end - start) / 1000;
  let d = parseInt(secsRemaining / 86400);
  let h = parseInt((secsRemaining % 86400) / 3600);
  let m = parseInt((secsRemaining % 3600) / 60);
  let s = parseInt(secsRemaining % 60);
  if (d) {
    _string = _string + d + "d ";
  }
  if (h) {
    _string = _string + h + "h ";
  }
  if (m) {
    _string = _string + m + "m ";
  }
  if (s) {
    _string = _string + s + "s ";
  }
  return _string.trim();
}

// Set time on HTML clocks
function setClocks() {
  let now = new Date();
  let nowTime = now.getTime();
  for (i = 0; i < startingPrices.length; i++) {
    let timer = document.getElementById("time-left-" + i);
    // remove finished auction after 5 minutes
    if (endTimes[i] - nowTime < -300) {
      document.getElementById("auction-" + i).parentElement.style.display =
        "none";
      if (demoAuction) {
        endTimes[i] = new Date(endTimes[i]).setDate(now.getDate() + 1); // add 1 day
        document.getElementById("auction-" + i).parentElement.remove();
        resetLive(i);
        resetStore(i);
        auctionGrid = document.getElementById("auction-grid");
        auctionCard = generateAuctionCard(i);
        auctionGrid.appendChild(auctionCard);
      }
      // disable bidding on finished auctions
    } else if (endTimes[i] - nowTime < 0) {
      timer.innerHTML = "Auction Complete";
      document.getElementById("bid-button-" + i).setAttribute("disabled", "");
    } else {
      timer.innerHTML = timeBetween(nowTime, endTimes[i]);
    }
  }
  setTimeout(setClocks, 1000);
}

// Place a bid on an item
function placeBid() {
  let nowTime = new Date().getTime();
  let modalBidButton = document.querySelector(
    "#bid-modal > div > div > div.modal-footer > button.btn.btn-primary"
  );
  modalBidButton.setAttribute("disabled", ""); // disable the button while we check
  let i = modalBidButton.id.match("[0-9]+");
  let feedback = document.getElementById("bad-amount-feedback");
  // Cleanse input
  let amountElement = document.getElementById("amount-input");
  let amount = Number(amountElement.value);
  if (endTimes[i] - nowTime < 0) {
    feedback.innerText = "The auction is already over!";
    amountElement.classList.add("is-invalid");
    setTimeout(() => {
      bidModal.hide();
      amountElement.classList.remove("is-invalid");
      modalBidButton.removeAttribute("disabled", "");
    }, 1000);
  } else if (amount == 0) {
    // amount was empty
    feedback.innerText = "Please specify an amount!";
    amountElement.classList.add("is-invalid");
    modalBidButton.removeAttribute("disabled", "");
  } else if (!/^-?\d*\.?\d{0,2}$/.test(amount)) {
    // field is does not contain money
    feedback.innerText = "Please specify a valid amount!";
    amountElement.classList.add("is-invalid");
    modalBidButton.removeAttribute("disabled", "");
  } else {
    // Checking bid amount
    // Get item and user info
    let user = auth.currentUser;
    let itemId = i.toString().padStart(5, "0");
    // Documents to check and write to
    let liveRef = JSON.parse(localStorage.getItem("liveRef"));
    console.log(itemId);
    console.log(i[0]);
    const newId = i[0];
    liveRef.push({ amount, newId });
    localStorage.setItem("liveRef", JSON.stringify(liveRef));
    // let storeRef = db.collection("auction-store").doc(itemId);

    console.log("Database write from placeBid()");
    amountElement.classList.add("is-valid");
    amountElement.classList.remove("is-invalid");
    setTimeout(() => {
      bidModal.hide();
      amountElement.classList.remove("is-valid");
      modalBidButton.removeAttribute("disabled", "");
    }, 1000);
  }
}

function argsort(array) {
  const arrayObject = array.map((value, idx) => {
    return { value, idx };
  });
  arrayObject.sort((a, b) => a.value - b.value);
  return arrayObject.map((data) => data.idx);
}

function generateAuctionCard(i) {
  // create auction card
  let col = document.createElement("div");
  col.classList.add("col");

  let card = document.createElement("div");
  card.classList.add("card");
  card.id = "auction-" + i;
  col.appendChild(card);

  let image = document.createElement("img");
  image.classList.add("card-img-top");
  image.src = primaryImages[i];
  card.appendChild(image);

  let body = document.createElement("div");
  body.classList.add("card-body");
  card.appendChild(body);

  let title = document.createElement("h5");
  title.classList.add("title");
  title.innerText = titles[i];
  body.appendChild(title);

  let subtitle = document.createElement("p");
  subtitle.classList.add("card-subtitle");
  subtitle.innerText = subtitles[i];
  body.appendChild(subtitle);

  // Auction status
  let statusTable = document.createElement("table");
  statusTable.classList.add("table");
  card.appendChild(statusTable);

  let tableBody = document.createElement("tbody");
  statusTable.appendChild(tableBody);

  let bidRow = document.createElement("tr");
  tableBody.appendChild(bidRow);

  // let bidTitle = document.createElement("th");
  // bidTitle.innerHTML = "Current bid:";
  // bidTitle.scope = "row";
  // bidRow.appendChild(bidTitle);

  // let bid = document.createElement("td");
  // bid.innerHTML = "£-.-- [- bids]";
  // bid.id = "current-bid-" + i;
  // bidRow.appendChild(bid);

  let timeRow = document.createElement("tr");
  tableBody.appendChild(timeRow);

  let timeTitle = document.createElement("th");

  let time = document.createElement("td");
  time.id = "time-left-" + i;
  timeRow.appendChild(time);

  // Auction actions
  let buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");
  card.appendChild(buttonGroup);

  let infoButton = document.createElement("button");
  infoButton.type = "button";
  infoButton.href = "#";
  infoButton.classList.add("btn", "btn-secondary");
  infoButton.innerText = "Info";
  infoButton.onclick = function () {
    openInfo(this.id);
  };
  infoButton.id = "info-button-" + i;
  buttonGroup.appendChild(infoButton);

  let bidButton = document.createElement("button");
  bidButton.type = "button";
  bidButton.href = "#";
  bidButton.classList.add("btn", "btn-primary");
  bidButton.innerText = "Submit bid";
  bidButton.onclick = function () {
    openBid(this.id);
  };
  bidButton.id = "bid-button-" + i;
  buttonGroup.appendChild(bidButton);

  return col;
}

// Generatively populate the websire with auctions
function populateAuctionGrid() {
  auctionGrid = document.getElementById("auction-grid");
  let endingSoonest = argsort(endTimes);
  endingSoonest.forEach((i) => {
    auctionCard = generateAuctionCard(i);
    auctionGrid.appendChild(auctionCard);
  });
  if (demoAuction) {
    generateRandomAuctions();
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dataListener() {
  // Listen for updates in active auctions
  db.collection("auction-live")
    .doc("items")
    .onSnapshot(function (doc) {
      console.log("Database read from dataListener()");
      let data = doc.data();
      for (key in data) {
        let cb = document.getElementById("current-bid-" + Number(key));
        let bids = data[key];
        // Extract bid data
        let bidCount = (Object.keys(bids).length - 1) / 2;
        let currPound = Number.parseFloat(bids["bid" + bidCount]).toFixed(2);
        // Check if the user is winning
        if (auth.currentUser) {
          let userWinning =
            bids["bid" + bidCount + "-user"] == auth.currentUser.uid;
        }
        // Add bid data to HTML
        cb.innerHTML =
          "£" +
          numberWithCommas(currPound) +
          " [" +
          bidCount +
          " bid" +
          (bidCount != 1 ? "s" : "") +
          "]";
      }
    });
}

function resetLive(i) {
  let docRef = db.collection("auction-live").doc("items");
  let itemId = i.toString().padStart(5, "0");
  docRef.update({
    [itemId]: {
      bid0: startPrices[i]["bid0"]["amount"],
    },
  });
  console.log("Database write from resetLive()");
}

function resetAllLive() {
  console.log("Resetting live tracker");
  for (i = 0; i < startingPrices.length; i++) {
    resetLive(i);
  }
}

function resetStore(i) {
  let itemId = i.toString().padStart(5, "0");
  let docRef = db.collection("auction-store").doc(itemId);
  docRef.set(startPrices[i]);
  console.log("Database write from resetStore()");
}

function resetAllStore() {
  console.log("Resetting auction storage");
  let batch = db.batch();
  for (i = 0; i < startingPrices.length; i++) {
    let itemId = i.toString().padStart(5, "0");
    let currentItem = db.collection("auction-store").doc(itemId);
    batch.set(currentItem, startPrices[i]);
  }
  batch.commit();
  console.log(startingPrices.length + " database writes from resetAllStore()");
}

function resetAll() {
  resetAllLive();
  resetAllStore();
}
