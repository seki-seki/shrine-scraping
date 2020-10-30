import client from "cheerio-httpcli";
import kyushuShrines from "./kyushu";
import fs from "fs";
const pageLimit = 10;
const main = () => {
  const range = n => [...Array(n).keys()];
  const inc = n => ++n
  kyushuShrines.forEach(prefecture => {
    const csvFileName = `dist/${prefecture}.csv`;
    fs.writeFileSync(csvFileName,"社格,名前,読み,住所,電話番号,画像,詳細ページのリンク",{flag: "w"});
    client.fetch(`http://shrine.mobi/area/kyushu/${prefecture}/`, (e, $, res, body) => {
      const count = $(".line_head>h2").text().match(/.*?(\d+).*?/)[1];
      const page = Math.ceil(Number.parseInt(count) / pageLimit);
      const pages = range(page).map(inc);
      pages.forEach(page => {
        client.fetch(`http://shrine.mobi/area/kyushu/${prefecture}/${page}`, (e, $, res, body) => {
          const shrine = $("li.clearfix")
          shrine.each((i, element) => {
            const shakaku = $(element).find("p>span.shakaku").text().match(/社格：(.*)/)[1];
            const shrineNameKanji = $(element).find("p>span.shop_name>ruby>rb").text();
            const shrineNameHiragana = $(element).find("p>span.shop_name>ruby>rt").text();
            const [address, phoneNumber] = $(element).find("p>span.address").text().split("\n");
            const imageUrl = `https://shrine.mobi${$(element).find("img").attr("src")}`;
            const detailPageUrl = `https://shrine.mobi${$(element).find("a").attr("href")}`;
            fs.writeFile(csvFileName,`${shakaku},${shrineNameKanji},${shrineNameHiragana},${address},${phoneNumber},${imageUrl},${detailPageUrl}\n`,{flag:"a"},(err) => {
              if (err) throw err;
            })
          })
        })
      })
    })
  })
};
const isExistFile= (file)=> {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
};
main();
