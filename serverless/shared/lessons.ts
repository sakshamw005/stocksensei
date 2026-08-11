export const LESSONS = [
  {
    slug: 'market-cap',
    title: 'Market Cap',
    explanation: 'Market capitalisation is the total market value of a company\u2019s equity: share price \u00d7 shares outstanding. It measures size, not intrinsic worth.',
    challenge_type: 'mc',
    question: 'Reliance Industries has roughly 676 crore shares outstanding and trades near \u20b92,900. What is its market cap?',
    options: ['\u20b91.96 lakh crore', '\u20b919.6 lakh crore', '\u20b92,900 crore', '\u20b9676 crore'],
    answer: '\u20b919.6 lakh crore',
    context: '676 crore \u00d7 \u20b92,900 \u2248 \u20b919,60,400 crore = \u20b919.6 lakh crore.'
  },
  {
    slug: 'face-value',
    title: 'Face Value',
    explanation: 'Face value is the nominal value of a share set in the company\u2019s books at issue, typically \u20b91, \u20b92, \u20b95 or \u20b910. It matters for accounting and dividends, not for market price.',
    challenge_type: 'mc',
    question: 'TCS shares have a face value of \u20b91 and trade near \u20b93,900. Which is true?',
    options: ['Face value equals market price', 'Market price is far above face value', 'Face value is \u20b93,900', 'Face value is irrelevant to dividends'],
    answer: 'Market price is far above face value',
    context: 'A \u20b91 face-value share can trade at thousands; the two are unrelated.'
  },
  {
    slug: 'book-value',
    title: 'Book Value',
    explanation: 'Book value is net asset value per share: total assets minus intangible assets and liabilities, divided by shares outstanding. It approximates liquidation value per share.',
    challenge_type: 'mc',
    question: 'Infosys has a book value near \u20b9170 per share. If it trades at \u20b91,700, its P/B ratio is:',
    options: ['1.0', '10.0', '0.1', '170'],
    answer: '10.0',
    context: 'P/B = price \u00f7 book value = 1700 \u00f7 170 = 10.'
  },
  {
    slug: 'eps',
    title: 'EPS',
    explanation: 'Earnings per share is net profit divided by shares outstanding. It shows how much profit is attributable to each share.',
    challenge_type: 'mc',
    question: 'HDFC Bank reported net profit of \u20b964,060 crore with ~755 crore shares outstanding. EPS is closest to:',
    options: ['\u20b98.5', '\u20b985', '\u20b9985', '\u20b90.85'],
    answer: '\u20b985',
    context: '64,060 \u00f7 755 \u2248 \u20b984.9 per share.'
  },
  {
    slug: 'pe-ratio',
    title: 'P/E Ratio',
    explanation: 'The price-to-earnings ratio compares share price to EPS. A lower P/E can mean a cheaper valuation, but context and growth matter.',
    challenge_type: 'mc',
    question: 'A company trades at \u20b91,500 with EPS of \u20b9150. Its P/E is:',
    options: ['10', '100', '0.1', '15'],
    answer: '10',
    context: 'P/E = 1500 \u00f7 150 = 10.'
  },
  {
    slug: 'industry-pe',
    title: 'Industry P/E',
    explanation: 'Industry P/E is the average P/E of peer companies in the same sector. Comparing a stock\u2019s P/E to its industry P/E shows whether it trades at a premium or discount.',
    challenge_type: 'mc',
    question: 'TCS trades at a P/E of 30 while the IT industry P/E is 28. This suggests TCS trades at a:',
    options: ['Discount', 'Premium', 'Fair value exactly', 'Loss'],
    answer: 'Premium',
    context: '30 > 28 means a slight premium to peers.'
  },
  {
    slug: 'pb-ratio',
    title: 'P/B Ratio',
    explanation: 'Price-to-book compares market price to book value per share. It is commonly used for banks and asset-heavy businesses.',
    challenge_type: 'mc',
    question: 'State Bank of India trades near \u20b9800 with a book value of \u20b9400. Its P/B is:',
    options: ['0.5', '2.0', '4.0', '400'],
    answer: '2.0',
    context: '800 \u00f7 400 = 2.0.'
  },
  {
    slug: 'ebitda',
    title: 'EBITDA',
    explanation: 'EBITDA is earnings before interest, tax, depreciation and amortisation \u2014 a proxy for operating cash generation from core operations.',
    challenge_type: 'mc',
    question: 'A company has revenue of \u20b91,000 crore and operating costs of \u20b9700 crore (excl. interest, tax, depreciation). EBITDA is:',
    options: ['\u20b9700 crore', '\u20b9300 crore', '\u20b91,000 crore', '\u20b9100 crore'],
    answer: '\u20b9300 crore',
    context: '1000 \u2212 700 = 300 crore operating profit.'
  },
  {
    slug: 'revenue-qoq-vs-yoy',
    title: 'Revenue QoQ vs YoY',
    explanation: 'Quarter-on-quarter compares one quarter to the previous quarter; year-on-year compares to the same quarter a year ago. YoY removes seasonality; QoQ shows recent momentum.',
    challenge_type: 'mc',
    question: 'Q3 revenue is \u20b9120 crore vs \u20b9100 crore in Q2 and \u20b990 crore in Q3 last year. The YoY growth is:',
    options: ['20%', '33%', '10%', '11%'],
    answer: '33%',
    context: 'YoY = (120 \u2212 90) / 90 = 33.3%.'
  },
  {
    slug: 'profit-growth',
    title: 'Profit Growth',
    explanation: 'Profit growth measures how net profit changes over a period. Consistent double-digit growth is positive; declining profit raises concern.',
    challenge_type: 'mc',
    question: 'Asian Paints grew net profit from \u20b93,000 crore to \u20b93,300 crore. Profit growth is:',
    options: ['10%', '30%', '11%', '100%'],
    answer: '10%',
    context: '(3300 \u2212 3000) / 3000 = 10%.'
  },
  {
    slug: 'debt-to-equity',
    title: 'Debt-to-Equity',
    explanation: 'Debt-to-equity compares total debt to shareholders\u2019 equity. Below 1 is generally conservative; above 2 can signal elevated leverage risk.',
    challenge_type: 'mc',
    question: 'A company has debt of \u20b94,000 crore and equity of \u20b910,000 crore. Its D/E is:',
    options: ['0.4', '2.5', '4.0', '0.25'],
    answer: '0.4',
    context: '4000 \u00f7 10000 = 0.4 (conservative).'
  },
  {
    slug: 'roe',
    title: 'ROE',
    explanation: 'Return on equity measures net profit as a percentage of shareholders\u2019 equity \u2014 how efficiently the company uses investor capital. Above 15% is typically strong.',
    challenge_type: 'mc',
    question: 'A company has net profit of \u20b91,500 crore and equity of \u20b97,500 crore. ROE is:',
    options: ['5%', '20%', '15%', '50%'],
    answer: '20%',
    context: '1500 \u00f7 7500 = 20%.'
  },
  {
    slug: 'dividend-yield',
    title: 'Dividend Yield',
    explanation: 'Dividend yield is annual dividend per share divided by share price, as a percentage. It shows income return independent of price moves.',
    challenge_type: 'mc',
    question: 'ITC pays \u20b915 per share annually and trades at \u20b9450. Its dividend yield is:',
    options: ['3.3%', '30%', '15%', '0.03%'],
    answer: '3.3%',
    context: '15 \u00f7 450 = 3.3%.'
  },
  {
    slug: 'free-cash-flow',
    title: 'Free Cash Flow',
    explanation: 'Free cash flow is operating cash flow minus capital expenditure \u2014 cash left after maintaining the business. Positive, growing FCF signals financial flexibility.',
    challenge_type: 'mc',
    question: 'A company has operating cash flow of \u20b92,000 crore and capex of \u20b91,200 crore. Free cash flow is:',
    options: ['\u20b93,200 crore', '\u20b9800 crore', '\u20b91,200 crore', '\u20b92,000 crore'],
    answer: '\u20b9800 crore',
    context: '2000 \u2212 1200 = 800 crore.'
  }
];
