process.env.SECRET = "1230";

const { issueTokenWith } = require("../../server/routes/user");
const jwt = require("jsonwebtoken");
jest.mock('../../server/utils/Log');

describe('issueTokenWith', () => {
   it('should return error when sso service return null', done => {
     const authDone = (err, response) => {
       expect(err).toBeInstanceOf(Error);
       done();
     };
     issueTokenWith(() => null, () => {})("", authDone);

   });

  it('should hand over sso result to the createUser function', done => {
    const ssoService = () => ({ department: "somewhere" });
    const createUser = (result) => {
      expect(result.department).toBe("somewhere");
      return [{ id: "123" }];
    };
    const authDone = (err, response) => {
      expect(err).toBeFalsy();
      expect(response).toBeDefined();
      done();
    };
    issueTokenWith(ssoService, createUser)("", authDone);
  });

  it('should return jwt token with id of the created record', done => {
    const authDone = (err, response) => {
      expect(err).toBeFalsy();
      // TODO:: Verify and validate response.appToken
      console.log("verify", jwt.verify(response.appToken, "1230", { ignoreExpiration: true }));
      done();
    };
    const createUser = () => [{ id: "123" }];
    issueTokenWith(() => ({}), createUser)("", authDone);
  });
});
