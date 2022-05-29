module.exports = {
  maxConcurrency: 1,
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        filename: 'jest-report.html',
        expand: true,
      },
    ],
  ],
}
