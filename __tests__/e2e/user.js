const { execSync } = require("child_process");
const path = require('path');
const cwd = process.cwd();
const src = path.join(cwd, "server");

const { issueTokenWith, createUserFromKaistUserInfo } = require("../../server/routes/user");

jest.mock('../../server/utils/Log');

describe('involving users', () => {
   let models = require('../../server/models');

   beforeEach(async () => {
       await models.sequelize.sync({ force: true });
       console.log('[sequelize] sync complete');
   });

   it('some fields can be null',async () => {
       await expect(models.Users.findOrCreate({
           where: {kaist_uid: "TEST"},
           defaults: {
               displayname: "TEST",
               ku_kname: "TEST",
               ku_kaist_org_id: "TEST",
               mobile: null,
               isAdmin: false,
           }
       })).resolves.toBeDefined();
   });
   
   describe('Register with KAIST SSO', () => {
        const mockUser = {
            displayname: "TEST",
            ku_kname: "TEST",
            kaist_uid: "123",
            ku_departmentcode: "TEST",
            mobile: null,
        };

        const failingIssue = issueTokenWith(() => null, createUserFromKaistUserInfo);
        const succeedingIssue = issueTokenWith(() => mockUser, createUserFromKaistUserInfo);

        it('emits error when SSO failed', (done) => {
            succeedingIssue('', (err) => {
                expect(err).toBeFalsy();
                done();
            })
        })

        it('register the user using data from SSO', (done) => {
            models.Users.count().then(countBefore => {
                succeedingIssue('', (err, result) => {
                    expect(err).toBeFalsy();
                    models.Users.findByPk(result.id).then(user => {
                        expect(user.kaist_uid).toBe(mockUser.kaist_uid); 
                        return models.Users.count();
                    }).then(countAfter => {
                        expect(countAfter - countBefore).toBe(1);
                        done();
                    });
                });
            });

        })

       it('does not require mobile number', (done) => {
        
        succeedingIssue('', (err, _) => {
            expect(err).toBeFalsy();
            done();
        });
       });

       it('update the user when already has registered', (done) => {
        succeedingIssue('', (err, firstResult) => {
            expect(err).toBeFalsy();
            succeedingIssue('', (_err, secondResult) => {
                expect(firstResult.id).toBe(secondResult.id);
                done();
            })
        });
       });

   });

   afterAll(async () => {
       await models.sequelize.close();
   });
});
