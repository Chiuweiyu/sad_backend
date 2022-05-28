const { register } = require("../routes/account")
const { postUpdateSheet, postCreateFile } = require("../routes/data_updater")
const { getUser, getListData, getDailyData, getfoodType, getDetailDataByGid, getMySheet } = require("../routes/info_getter")

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeAll(async () => {
  await new Promise(r => setTimeout(r, 500))
  const res = mockResponse()
  await register({ body: { userName: 'user', password: 'password' } }, res, {})
  await postUpdateSheet({ body: { userName: 'user', data: [{ title: 'sheet', type: 'type', left: 'left', right: 'right' }] } }, res, {})
  await postCreateFile({
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
  }, res, {})
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('getUser', () => {
  it('should get user information successfully', async () => {
    const req = { body: { userName: 'user' } }
    const res = mockResponse()
    await getUser(req, res, {})
    expect(res.json).toHaveBeenCalledWith({ "level": 1, "name": "user", "record": 1 })
  })

  it('should discover missing account', async () => {
    const req = { body: { userName: 'non_existent_user' } }
    const res = mockResponse()
    await getUser(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('This account does not exist.')
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await getUser(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})

describe('getListData', () => {
  it('should get list data successfully', async () => {
    const req = { body: { userName: 'user', tag: 'type', foodKeyword: 'food', startDay: '2022-01-01', endDay: '2025-12-31' } }
    const res = mockResponse()
    await getListData(req, res, {})
    expect(res.json).toHaveBeenCalledWith([{ "date": "Mar 31", "food": "food", "foodTag": "type", "gid": 1, "likeVal": 0, "linearObjects": [{ "sheet_id": 1, "title": "sheet", "value": "s" }], "photo": "image", "reminder": "reminder", "restaurant": "restaurant", "spicyVal": 0, "stringObjects": [], "time": "00:00:00" }])
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await getListData(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})

describe('getfoodType', () => {
  it('should return food types successfully', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await getfoodType(req, res, {})
    expect(res.json).toHaveBeenCalledWith([{ "gid": 1, "title": "type" }])
  })
})

describe('getDailyData', () => {
  it('should get daily data successfully', async () => {
    const req = { body: { userName: 'user', foodKeyword: 'food', startDay: '2022-01-01', endDay: '2025-12-31' } }
    const res = mockResponse()
    await getDailyData(req, res, {})
    expect(res.json).toHaveBeenCalledWith([{ "date": "Mar 31", "files": [{ "gid": 1, "photo": "image" }], "year": "2022" }])
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await getDailyData(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})

describe('getDetailDataByGid', () => {
  it('should get detailed data by gid', async () => {
    const req = { body: { gid: '1' } }
    const res = mockResponse()
    await getDetailDataByGid(req, res, {})
    expect(res.json).toHaveBeenCalledWith({ "date": "Mar 31", "food": "food", "foodTag": "type", "gid": 1, "likeVal": 0, "linearObjects": [{ "sheet_id": 1, "title": "sheet", "value": "s" }], "photo": "image", "reminder": "reminder", "restaurant": "restaurant", "spicyVal": 0, "stringObjects": [], "time": "00:00:00" })
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await getDetailDataByGid(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})

describe('getMySheet', () => {
  it('should return user sheet', async () => {
    const req = { body: { userName: 'user' } }
    const res = mockResponse()
    await getMySheet(req, res, {})
    expect(res.json).toHaveBeenCalledWith([{ "gid": 1, "left": "left", "right": "right", "title": "sheet", "type": "type" }])
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await getMySheet(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})