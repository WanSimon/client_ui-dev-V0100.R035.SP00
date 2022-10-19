const getters = {
  //获取地址
  addr: state =>{
    if(state.equipmentInfo && state.equipmentInfo.equipment_group_info ) return state.equipmentInfo.equipment_group_info.addr||"";
    else return "";
  },
  temperature: state => state.temperature_humidity_info.temperature,
  humidity: state => state.temperature_humidity_info.humidity,
  phone:state => state.equipmentInfo?(state.equipmentInfo.equipment_group_info.phone||""):"",
  qr_code:state => state.equipmentInfo?(state.equipmentInfo.equipment_group_info.qr_code||""):"",
  noticeList: state => state.noticeList,
  equipmentFault: state => state.equipmentFault,
};
export default getters;
