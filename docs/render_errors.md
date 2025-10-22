==> Cloning from https://github.com/TKHatton/Meno.i
==> Checking out commit 5964b71e051c93b55ab1be771032cc4148363c1c in branch main
==> Using Node.js version 22.16.0 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Running build command 'npm install && npm run build'...
added 389 packages, and audited 392 packages in 10s
53 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
> @menoai/backend@1.0.0 build
> tsc
src/index.ts(6,21): error TS7016: Could not find a declaration file for module 'express'. '/opt/render/project/src/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`
src/index.ts(7,18): error TS7016: Could not find a declaration file for module 'cors'. '/opt/render/project/src/node_modules/cors/lib/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/cors` if it exists or add a new declaration (.d.ts) file containing `declare module 'cors';`
src/index.ts(35,12): error TS7006: Parameter 'origin' implicitly has an 'any' type.
src/index.ts(35,20): error TS7006: Parameter 'callback' implicitly has an 'any' type.
src/index.ts(55,10): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/index.ts(55,15): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/index.ts(55,20): error TS7006: Parameter 'next' implicitly has an 'any' type.
src/lib/supabase.ts(7,85): error TS2307: Cannot find module '@menoai/shared' or its corresponding type declarations.
src/middleware/adminAuth.ts(6,49): error TS7016: Could not find a declaration file for module 'express'. '/opt/render/project/src/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`
src/middleware/auth.ts(6,49): error TS7016: Could not find a declaration file for module 'express'. '/opt/render/project/src/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`
src/routes/admin.ts(8,57): error TS7016: Could not find a declaration file for module 'express'. '/opt/render/project/src/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`
src/routes/admin.ts(30,30): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/admin.ts(30,35): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/admin.ts(86,29): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/admin.ts(86,34): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/chat.ts(6,24): error TS7016: Could not find a declaration file for module 'express'. '/opt/render/project/src/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`
src/routes/chat.ts(18,33): error TS2307: Cannot find module '@menoai/shared' or its corresponding type declarations.
src/routes/chat.ts(33,29): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/chat.ts(33,34): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/chat.ts(139,47): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/chat.ts(139,52): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/chat.ts(181,45): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/chat.ts(181,50): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/chat.ts(203,55): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/chat.ts(203,60): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/chat.ts(237,36): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/chat.ts(237,41): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/routes/health.ts(6,24): error TS7016: Could not find a declaration file for module 'express'. '/opt/render/project/src/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`
src/routes/health.ts(14,18): error TS7006: Parameter 'req' implicitly has an 'any' type.
src/routes/health.ts(14,23): error TS7006: Parameter 'res' implicitly has an 'any' type.
src/services/ai.ts(7,54): error TS2307: Cannot find module '@menoai/shared' or its corresponding type declarations.
src/services/ai.ts(8,62): error TS2307: Cannot find module '@menoai/shared' or its corresponding type declarations.
npm error Lifecycle script `build` failed with error:
npm error code 2
npm error path /opt/render/project/src/packages/backend
npm error workspace @menoai/backend@1.0.0
npm error location /opt/render/project/src/packages/backend
npm error command failed
npm error command sh -c tsc
==> Build failed 😞
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys