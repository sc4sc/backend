const { execSync } = require("child_process");
const path = require('path');
const cwd = process.cwd();
const src = path.join(cwd, "server");

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

   afterAll(async () => {
       await models.sequelize.close();
   });
});
