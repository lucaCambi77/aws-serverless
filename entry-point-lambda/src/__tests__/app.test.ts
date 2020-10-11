import fs from 'fs';
import KinesisToEventConverter from '../converter/KinesisToEventConverter';
import EventValidation from '../validation/EventValidation';
import Validation from '../validation/Validation';
import SchedulingAuditService from '../service/SchedulingAuditService';
import StepFunctionUtil from '../util/StepFunctionUtil';
import {StepFunctionValidation} from '../validation/StepFunctionValidation';
import StepFunctionService from '../service/StepFunctionService';
import {status} from '../const/EventStatus';
import {Response} from "../model/Response";
import {logger} from "@rides/taxi-winston-logger";

const app = require('../app');

jest.mock('../validation/StepFunctionValidation');
jest.mock('../validation/StepFunctionValidation');
jest.mock('../validation/EventValidation');
jest.mock('../service/StepFunctionService');
jest.mock('../service/SchedulingAuditService');

const spyPut = jest.spyOn(SchedulingAuditService.prototype, 'put');

const spyOnError = jest.spyOn(logger, 'error');
const spyOnWarn = jest.spyOn(logger, 'warn');

const kinesisJson = fs.readFileSync('./events/kinesis.json',
    {encoding: 'utf8', flag: 'r'});

const records = JSON.parse(kinesisJson);

describe('Test app', function () {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Verify kinesis', function () {

        test('verifies null kinesis', () => {

            const spy = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');
            app.lambdaHandler(null);
            expect(spy).toHaveBeenCalledTimes(0);
        });

        test('verifies invalid kinesis missing task', async () => {

            const wrongKinesisJson = fs.readFileSync('./events/kinesis-missing-task.json',
                {encoding: 'utf8', flag: 'r'});
            const spy = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');
            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().withError('error')
            );

            const records = JSON.parse(wrongKinesisJson);

            await app.lambdaHandler(records);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spyOnWarn).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(0);
        });

        test('verifies invalid kinesis json format data', async () => {

            const wrongKinesisJson = fs.readFileSync('./events/kinesis-invalid-data.json',
                {encoding: 'utf8', flag: 'r'});
            const spy = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');
            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().withError('error')
            );

            const records = JSON.parse(wrongKinesisJson);

            await app.lambdaHandler(records);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spyOnWarn).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(0);
        });
    });

    describe('Verify application flow', function () {

        test('verifies event validation with error', () => {

            spyPut.mockReturnValueOnce(new Promise<Response>((resolve) => {
                resolve({status: 200, error: null});
            }));

            const spyKinesisConverter = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');

            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().withError('error')
            );

            app.lambdaHandler(records);

            expect(spyKinesisConverter).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledWith(expect.any(Date), expect.anything(), status.MISSING_ATTRIBUTES, expect.anything());
            expect(spyOnError).toHaveBeenCalledTimes(1);
        });

        test('verifies event validation ok, step function validation input fails', () => {

            spyPut.mockReturnValueOnce(new Promise<Response>((resolve) => {
                resolve({status: 200, error: null});
            }));

            const spyKinesisConverter = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');

            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionValidationInput = jest.spyOn(StepFunctionUtil, 'getStepFunctionStartExecutionInput').mockReturnValueOnce(
                null
            );

            const spyStepFunctionGetInput = jest.spyOn(StepFunctionValidation.prototype, 'validateInput').mockReturnValueOnce(
                new Validation().withError('error')
            );

            app.lambdaHandler(records);

            expect(spyKinesisConverter).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionGetInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionValidationInput).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledWith(expect.any(Date), expect.anything(), status.INVALID_PAYLOAD, expect.anything());
            expect(spyOnError).toHaveBeenCalledTimes(1);
        });

        test('step function validation input ok, start state fails', async () => {

            spyPut.mockReturnValueOnce(new Promise<Response>((resolve) => {
                resolve({status: 200, error: null});
            }));

            const spyKinesisConverter = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');

            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionValidationInput = jest.spyOn(StepFunctionUtil, 'getStepFunctionStartExecutionInput').mockReturnValueOnce(
                null
            );

            const spyStepFunctionGetInput = jest.spyOn(StepFunctionValidation.prototype, 'validateInput').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionStartState = jest.spyOn(StepFunctionService.prototype, 'startMachineStateFrom').mockReturnValueOnce(
                new Promise<Validation>((resolve) => {
                    resolve(new Validation().withError('error'));
                })
            );

            await app.lambdaHandler(records);

            expect(spyKinesisConverter).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionGetInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionValidationInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionStartState).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledWith(expect.any(Date), expect.anything(), status.STATE_MACHINE_START_FAILED, expect.anything());
            expect(spyOnError).toHaveBeenCalledTimes(1);
        });

        test('all is ok event scheduled', async () => {

            spyPut.mockReturnValueOnce(new Promise<Response>((resolve) => {
                resolve({status: 200, error: null});
            }));

            const spyKinesisConverter = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');

            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionValidationInput = jest.spyOn(StepFunctionUtil, 'getStepFunctionStartExecutionInput').mockReturnValueOnce(
                null
            );

            const spyStepFunctionGetInput = jest.spyOn(StepFunctionValidation.prototype, 'validateInput').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionStartState = jest.spyOn(StepFunctionService.prototype, 'startMachineStateFrom').mockReturnValueOnce(
                new Promise<Validation>((resolve) => {
                    resolve(new Validation().setValid(true));
                }));

            await app.lambdaHandler(records);

            expect(spyKinesisConverter).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionGetInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionValidationInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionStartState).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledWith(expect.any(Date), expect.anything(), status.SCHEDULED, null);
            expect(spyOnError).toHaveBeenCalledTimes(0);
        });

        test('all is ok event scheduled but put item fails', async () => {

            spyPut.mockReturnValueOnce(new Promise<Response>((resolve) => {
                resolve({status: 500, error: 'error'});
            }));

            const spyKinesisConverter = jest.spyOn(KinesisToEventConverter.prototype, 'convertFromKinesis');

            const spyEventValidator = jest.spyOn(EventValidation.prototype, 'validate').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionValidationInput = jest.spyOn(StepFunctionUtil, 'getStepFunctionStartExecutionInput').mockReturnValueOnce(
                null
            );

            const spyStepFunctionGetInput = jest.spyOn(StepFunctionValidation.prototype, 'validateInput').mockReturnValueOnce(
                new Validation().setValid(true)
            );

            const spyStepFunctionStartState = jest.spyOn(StepFunctionService.prototype, 'startMachineStateFrom').mockReturnValueOnce(
                new Promise<Validation>((resolve) => {
                    resolve(new Validation().setValid(true));
                }));

            await app.lambdaHandler(records);

            expect(spyKinesisConverter).toHaveBeenCalledTimes(1);
            expect(spyEventValidator).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionGetInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionValidationInput).toHaveBeenCalledTimes(1);
            expect(spyStepFunctionStartState).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledTimes(1);
            expect(spyPut).toHaveBeenCalledWith(expect.any(Date), expect.anything(), status.SCHEDULED, null);
            expect(spyOnError).toHaveBeenCalledTimes(1);
        });
    });
});
