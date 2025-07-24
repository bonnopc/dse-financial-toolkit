export function extractCompanyFullName($: cheerio.Root): string | undefined {
    let fullName = "";
    $("h2.BodyHead.topBodyHead").each((_index, element) => {
        const text = $(element).text();
        if (text.includes("Company Name:")) {
            fullName = $(element).find("i").text().trim();
        }
    });

    return fullName;
}