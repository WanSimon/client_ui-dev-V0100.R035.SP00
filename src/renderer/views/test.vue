<template>
  <div>
    <top-nav title-text="测试" :remaining="3600" :show-left-button="false" :show-right-button="true"></top-nav>
    <el-steps :active="1" align-center>
      <el-step title="步骤1" description="扫码或输入补货单号"></el-step>
      <el-step title="步骤2" description="点击开始补货"></el-step>
      <el-step title="步骤3" description="进行补货操作"></el-step>
      <el-step title="步骤4" description="核对药品数量，提交补货单"></el-step>
    </el-steps>
  </div>
</template>