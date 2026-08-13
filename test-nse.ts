import { fetchNseQuote } from "./src/fetchNseQuote";

fetchNseQuote("BAJFINANCE")
  .then((quote) => {
    console.log("SUCCESS:");
    console.log(quote);
  })
  .catch((err) => {
    console.error("FAILED:");
    console.error(err);
  });