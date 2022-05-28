const { register } = require('../routes/account')
const { postUpdateSheet, postCreateFile } = require('../routes/data_updater')

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeAll(async () => {
  await new Promise(r => setTimeout(r, 1000))
  await register({ body: { userName: 'user', password: 'password' } }, mockResponse(), {})
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('postUpdateSheet', () => {
  it('should update sheet successfully', async () => {
    const req = { body: { userName: 'user', data: [{ title: 'sheet', type: 'type', left: 'left', right: 'right' }] } }
    const res = mockResponse()
    await postUpdateSheet(req, res, {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith('OK')
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await postUpdateSheet(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})

describe('postCreateFile', () => {
  it('create file successfully', async () => {
    const req = {
      body: {
        userName: 'user',
        image: 'image',
        restaurant: 'restaurant',
        food: 'food',
        price: 0,
        type: 'type',
        place: 'place',
        likeVal: 0,
        spicyVal: 0,
        chosenSheet: 'sheet',
        reminder: 'reminder'
      }
    }
    const res = mockResponse()
    await postCreateFile(req, res, {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith('OK')
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await postCreateFile(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})