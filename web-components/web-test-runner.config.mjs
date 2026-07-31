import { importMapsPlugin } from '@web/dev-server-import-maps';
import { defaultReporter } from '@web/test-runner';
import { chromeLauncher } from '@web/test-runner-chrome';

export default {
    browsers: [
        chromeLauncher({
            launchOptions: { args: ['--no-sandbox'] },
        }),
    ],
    coverageConfig: {
        include: ['src/**'],
        exclude: [
            'test/mocks/**',
            'test/**',
            '**/node_modules/**',
            'src/bodyScrollLock.js', // todo
            'src/merch-whats-included.js', // on hold
            'src/variants/plans-v2.js', // @TODO by LL team
        ],
        threshold: {
            // TODO bump to 100%
            branches: 85,
            functions: 65,
            statements: 85,
            lines: 85,
        },
    },
    debug: false,
    files: ['test/**/*.test.(js|html)'],
    nodeResolve: true,
    mimeTypes: {
        '**/*.snap': 'html',
    },
    testFramework: {
        config: {
            // timeout in milliseconds; override with WTR_TEST_TIMEOUT on loaded dev boxes.
            timeout: Number(process.env.WTR_TEST_TIMEOUT ?? 10000),
        },
    },
    plugins: [
        importMapsPlugin({
            inject: {
                importMap: {
                    imports: {
                        react: '/test/mocks/react.js',
                        '@pandora/fetch': '/test/mocks/pandora-fetch.js',
                    },
                },
            },
        }),
    ],
    // Distinct from studio's and ost's default ports so all runners can coexist locally.
    port: Number(process.env.WTR_PORT_WC ?? 18203),
    concurrency: Number(process.env.WTR_CONCURRENCY ?? 2),
    reporters: [
        defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    ],
};
