import 'babel-polyfill';
process.env.MURAKAMI_VIZ_ADMIN_PASSWORD = 'areallylonggoodpassword';
process.env.MURAKAMI_VIZ_SECRETS = 'secret1,secret2';
window.URL.createObjectURL = function() {};
