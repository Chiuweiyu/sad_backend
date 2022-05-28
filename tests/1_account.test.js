const { register, verify_login } = require('../routes/account')

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeAll(async () => {
  await new Promise(r => setTimeout(r, 1000))
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('register', () => {
  it('should register successfully', async () => {
    const req = { body: { userName: 'user', password: 'password' } }
    const res = mockResponse()
    await register(req, res, {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith('OK')
  })

  it('should discover duplicate', async () => {
    const req = { body: { userName: 'user', password: 'password' } }
    const res = mockResponse()
    await register(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Account exists.')
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await register(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})

describe('verify_login', () => {
  it('should login successfully', async () => {
    const req = { body: { userName: 'user', password: 'password' } }
    const res = mockResponse()
    await verify_login(req, res, {})
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith('OK')
  })

  it('should discover missing account', async () => {
    const req = { body: { userName: 'non_existent_user', password: 'password' } }
    const res = mockResponse()
    await verify_login(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('This account does not exist.')
  })

  it('should discover incorrect password', async () => {
    const req = { body: { userName: 'user', password: 'bad_password' } }
    const res = mockResponse()
    await verify_login(req, res, {})
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.send).toHaveBeenCalledWith('Password is not correct.')
  })

  it('should check missing parameters', async () => {
    const req = { body: {} }
    const res = mockResponse()
    await verify_login(req, res, {})
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Missing parameters.')
  })
})