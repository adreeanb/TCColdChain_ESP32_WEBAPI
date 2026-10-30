import { Router } from 'express';

// ==========================================
// MIDDLEWARES
// ==========================================
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isMaster } from '../middlewares/isMaster.js';
import { isAdmin } from '../middlewares/isAdmin.js';

// ==========================================
// CONTROLLERS
// ==========================================

// Autenticação e Usuário
import { AuthUserController } from '../controllers/user/AuthUserController.js';
import { CurrentUserController } from '../controllers/user/CurrentUserController.js';
import { UpdateProfileController } from '../controllers/user/UpdateProfileController.js';
import { ChangePasswordController } from '../controllers/user/ChangePasswordController.js';
import { CreateUserController } from '../controllers/user/CreateUserController.js';
import { UpdateUserController } from '../controllers/user/UpdateUserController.js';
import { ListUsersController } from '../controllers/user/ListUsersController.js';
import { DeleteUserController } from '../controllers/user/DeleteUserController.js';

// Dashboard
import { GetDashboardSummaryController } from '../controllers/dashboard/GetDashboardSummaryController.js';

// Empresas (Enterprise)
import { CreateEnterpriseController } from '../controllers/enterprise/CreateEnterpriseController.js';
import { ListEnterprisesController } from '../controllers/enterprise/ListEnterprisesController.js';
import { GetEnterpriseController } from '../controllers/enterprise/GetEnterpriseController.js';
import { UpdateEnterpriseController } from '../controllers/enterprise/UpdateEnterpriseController.js';
import { DeleteEnterpriseController } from '../controllers/enterprise/DeleteEnterpriseController.js';

// Unidades Frias (ColdUnit - Câmaras Frias, Frigoríficos, Caminhões)
import { CreateColdUnitController } from '../controllers/coldUnit/CreateColdUnitController.js';
import { ListColdUnitsController } from '../controllers/coldUnit/ListColdUnitsController.js';
import { GetColdUnitController } from '../controllers/coldUnit/GetColdUnitController.js';
import { UpdateColdUnitController } from '../controllers/coldUnit/UpdateColdUnitController.js';
import { DeleteColdUnitController } from '../controllers/coldUnit/DeleteColdUnitController.js';
import { ListColdUnitAssociationsController } from '../controllers/coldUnit/ListColdUnitAssociationsController.js';

// Placas (ColdUnitDevice - Hardware ESP32 e vínculos)
import { CreateDeviceController } from '../controllers/device/CreateDeviceController.js';
import { ListDevicesController } from '../controllers/device/ListDevicesController.js';
import { ListUnboundDevicesController } from '../controllers/device/ListUnboundDevicesController.js';
import { BindDeviceController } from '../controllers/device/BindDeviceController.js';
import { UnbindDeviceController } from '../controllers/device/UnbindDeviceController.js';
import { DeactivateDeviceController } from '../controllers/device/DeactivateDeviceController.js';
import { ListDeviceAssociationsController } from '../controllers/device/ListDeviceAssociationsController.js';

// Telemetria (TemperatureReading)
import { CreateTemperatureReadingController } from '../controllers/telemetry/CreateTemperatureReadingController.js';
import { ListTemperatureReadingsController } from '../controllers/telemetry/ListTemperatureReadingsController.js';
import { ListTemperatureSeriesController } from '../controllers/telemetry/ListTemperatureSeriesController.js';

// Alertas (Alert)
import { ListAlertsController } from '../controllers/alert/ListAlertsController.js';
import { ResolveAlertController } from '../controllers/alert/ResolveAlertController.js';
const routes = Router();

// ==========================================
// 1. ROTAS PÚBLICAS
// ==========================================
const authUserController = new AuthUserController();

routes.post('/login', authUserController.handle);

// Endpoint público/autenticado por Token IoT para os sensores/hardware enviarem dados
const createTemperatureReadingController = new CreateTemperatureReadingController();
routes.post('/telemetry/readings', createTemperatureReadingController.handle);


// ==========================================
// 2. ROTAS DE USUÁRIO & PERFIL (AUTENTICADO)
// ==========================================
const currentUserController = new CurrentUserController();
const updateProfileController = new UpdateProfileController();
const changePasswordController = new ChangePasswordController();

routes.get('/me', isAuthenticated, currentUserController.handle);
routes.put('/me', isAuthenticated, updateProfileController.handle);
routes.put('/me/password', isAuthenticated, changePasswordController.handle);


// ==========================================
// 2.1. DASHBOARD
// ==========================================
const getDashboardSummaryController = new GetDashboardSummaryController();

routes.get('/dashboard/summary', isAuthenticated, getDashboardSummaryController.handle);


// ==========================================
// 3. GERENCIAMENTO DE EMPRESAS (ENTERPRISE)
// ==========================================
const createEnterpriseController = new CreateEnterpriseController();
const listEnterprisesController = new ListEnterprisesController();
const getEnterpriseController = new GetEnterpriseController();
const updateEnterpriseController = new UpdateEnterpriseController();
const deleteEnterpriseController = new DeleteEnterpriseController();

routes.post('/enterprises', isAuthenticated, isMaster, createEnterpriseController.handle);
routes.get('/enterprises', isAuthenticated, isMaster, listEnterprisesController.handle);
routes.get('/enterprises/:id', isAuthenticated, getEnterpriseController.handle);
routes.put('/enterprises/:id', isAuthenticated, isMaster, updateEnterpriseController.handle);
routes.delete('/enterprises/:id', isAuthenticated, isMaster, deleteEnterpriseController.handle);


// ==========================================
// 4. GERENCIAMENTO DE USUÁRIOS (POR EMPRESA/ADMIN)
// ==========================================
const createUserController = new CreateUserController();
const listUsersController = new ListUsersController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();

routes.post('/users', isAuthenticated, isAdmin, createUserController.handle);
routes.get('/users', isAuthenticated, isAdmin, listUsersController.handle);
routes.put('/users/:id', isAuthenticated, isAdmin, updateUserController.handle);
routes.delete('/users/:id', isAuthenticated, isAdmin, deleteUserController.handle);


// ==========================================
// 5. UNIDADES FRIAS (COLD UNITS)
// ==========================================
const createColdUnitController = new CreateColdUnitController();
const listColdUnitsController = new ListColdUnitsController();
const getColdUnitController = new GetColdUnitController();
const updateColdUnitController = new UpdateColdUnitController();
const deleteColdUnitController = new DeleteColdUnitController();

routes.post('/cold-units', isAuthenticated, isAdmin, createColdUnitController.handle);
routes.get('/cold-units', isAuthenticated, listColdUnitsController.handle);
routes.get('/cold-units/:id', isAuthenticated, getColdUnitController.handle);
routes.put('/cold-units/:id', isAuthenticated, isAdmin, updateColdUnitController.handle);
routes.delete('/cold-units/:id', isAuthenticated, isAdmin, deleteColdUnitController.handle);

const listColdUnitAssociationsController = new ListColdUnitAssociationsController();

routes.get('/cold-units/:id/associations', isAuthenticated, listColdUnitAssociationsController.handle);


// ==========================================
// 5.1. PLACAS E VÍNCULOS (COLD UNIT DEVICES)
// ==========================================
const createDeviceController = new CreateDeviceController();
const listDevicesController = new ListDevicesController();
const listUnboundDevicesController = new ListUnboundDevicesController();
const bindDeviceController = new BindDeviceController();
const unbindDeviceController = new UnbindDeviceController();
const deactivateDeviceController = new DeactivateDeviceController();
const listDeviceAssociationsController = new ListDeviceAssociationsController();

routes.post('/devices', isAuthenticated, isMaster, createDeviceController.handle);
routes.get('/devices', isAuthenticated, listDevicesController.handle);
routes.get('/devices/unbound', isAuthenticated, listUnboundDevicesController.handle);
routes.post('/devices/bind', isAuthenticated, bindDeviceController.handle);
routes.post('/devices/:id/unbind', isAuthenticated, unbindDeviceController.handle);
routes.patch('/devices/:id/deactivate', isAuthenticated, isMaster, deactivateDeviceController.handle);
routes.get('/devices/:id/associations', isAuthenticated, listDeviceAssociationsController.handle);


// ==========================================
// 6. HISTÓRICO DE TELEMETRIA / TEMPERATURA
// ==========================================
const listTemperatureReadingsController = new ListTemperatureReadingsController();
const listTemperatureSeriesController = new ListTemperatureSeriesController();

// Consulta o histórico de leituras filtrado por coldUnitId e intervalo de tempo
routes.get('/cold-units/:coldUnitId/readings', isAuthenticated, listTemperatureReadingsController.handle);
// Série agregada (mínimo, média e máximo) para períodos longos
routes.get('/cold-units/:coldUnitId/readings/series', isAuthenticated, listTemperatureSeriesController.handle);


// ==========================================
// 7. ALERTAS DE TEMPERATURA
// ==========================================
const listAlertsController = new ListAlertsController();
const resolveAlertController = new ResolveAlertController();

routes.get('/alerts', isAuthenticated, listAlertsController.handle);
routes.patch('/alerts/:id/resolve', isAuthenticated, resolveAlertController.handle);

export { routes };