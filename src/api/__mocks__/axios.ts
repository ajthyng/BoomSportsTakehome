module.exports = {
  get: jest.fn(() => {}),
  create: jest.fn(function (this: any) {
    return this
  })
}
