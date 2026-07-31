import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
    files: 'test/**/*.test.js',
    nodeResolve: true,
    // Distinct from studio's and web-components' default ports so all runners can
    // coexist locally.
    port: Number(process.env.WTR_PORT_OST ?? 18205),
    concurrency: Number(process.env.WTR_CONCURRENCY ?? 2),
    testFramework: {
        config: {
            timeout: Number(process.env.WTR_TEST_TIMEOUT ?? 5000),
        },
    },
    plugins: [esbuildPlugin({ js: true, define: { 'process.env.NODE_ENV': '"production"' } })],
    testRunnerHtml: (testFramework) =>
        `<html>
            <body>
                <script>
                    window.process = { env: { NODE_ENV: 'production' } };
                    window.__swc = window.__swc || {};
                </script>
                <script type="module" src="${testFramework}"></script>
            </body>
        </html>`,
};
