module.exports = {
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.js"],
    coverageDirectory: "coverage",
    coverageReporters: ["html", "text-summary"],
    reporters: [
        "default",
        ["jest-html-reporters", {
            outputPath: "./test_results",
            filename: "report.html",
            pageTitle: "BSquare SuperMart Test Report",
            expand: false,
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]

};
