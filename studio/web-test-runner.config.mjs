import { chromeLauncher } from '@web/test-runner-chrome';
import { importMapsPlugin } from '@web/dev-server-import-maps';

/** Set HEADED=1 so Chrome opens on-screen (for visual HTML tests, e.g. with it.only). */
const headed = process.env.HEADED === '1';
const slowMo = headed && process.env.WTR_SLOW_MO ? Number(process.env.WTR_SLOW_MO) : undefined;

const testRunnerHtml = (testFramework) => `
  <html>
  <head>
    <script type="module">
        window.process = { env: {} };
        window.__swc = { warn: () => {} };
    </script>
  </head>
  <body>
    <script type='module' src='${testFramework}'></script>
  </body>
</html>
`;

export default {
    browsers: [
        chromeLauncher({
            launchOptions: {
                args: ['--no-sandbox'],
                headless: !headed,
                devtools: headed,
                ...(slowMo != null && !Number.isNaN(slowMo) ? { slowMo } : {}),
            },
        }),
    ],
    coverageConfig: {
        include: ['src/**'],
        exclude: ['test/mocks/**', 'test/**', '**/node_modules/**'],
    },
    files: ['test/**/*.test.(js|html)'],
    middleware: [
        async (ctx, next) => {
            if (ctx.path.startsWith('/test/mocks/adobe/sites')) {
                ctx.set('Content-Type', 'application/json');
            }
            await next();
            ctx.set('Access-Control-Allow-Credentials', true);
            ctx.set('Access-Control-Allow-Origin', '*');
        },
    ],
    plugins: [
        importMapsPlugin({
            inject: {
                importMap: {
                    imports: {
                        react: '/test/mocks/react.js',
                        '@pandora/fetch': '/test/mocks/pandora-fetch.js',
                        'fragment-client': '/libs/fragment-client.js',
                    },
                },
            },
        }),
    ],
    nodeResolve: true,
    // Moved off port 2024: that overlaps a port the harness engine's own local
    // services use, which caused a real shadowing incident (2026-07-30). 18203-18205
    // is an adjacent, currently-unclaimed range (web-components=18203, studio=18204,
    // ost=18205); override with WTR_PORT_STUDIO if it collides with something else.
    port: Number(process.env.WTR_PORT_STUDIO ?? 18204),
    concurrency: Number(process.env.WTR_CONCURRENCY ?? 2),
    testFramework: {
        config: {
            // Keep the default tight in CI; loaded dev boxes can raise it via WTR_TEST_TIMEOUT.
            timeout: Number(process.env.WTR_TEST_TIMEOUT ?? 5000),
        },
    },
    testRunnerHtml,
};
