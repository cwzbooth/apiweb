<style lang="less" scoped>
  @import './user.less';
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card class="margin-bottom-10">
          <Form inline>
            <FormItem class="margin-bottom-0">
              <Select v-model="searchConf.status" clearable placeholder='请选择状态' style="width:120px">
                <Option :value="1">启用</Option>
                <Option :value="0">禁用</Option>
              </Select>
            </FormItem>
            <FormItem class="margin-bottom-0">
              <Select v-model="searchConf.type" clearable placeholder="请选择类别" style="width:120px">
                <Option :value="1">用户账号</Option>
                <Option :value="2">用户昵称</Option>
              </Select>
            </FormItem>
            <FormItem class="margin-bottom-0">
              <Input v-model="searchConf.keywords" placeholder=""></Input>
            </FormItem>
            <FormItem class="margin-bottom-0">
              <Button type="primary" @click="search">{{ $t('find_button') }}/{{ $t('refresh_button') }}</Button>
            </FormItem>
          </Form>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col span="24">
        <Card>
          <div class="margin-bottom-15">
            <Button type="primary" v-has="'User/add'" @click="alertAdd" icon="md-add">{{ $t('add_button') }}</Button>
          </div>
          <div>
            <Table :loading="listLoading" :columns="columnsList" :data="tableData" border stripe></Table>
          </div>
          <div class="margin-top-15" style="text-align: center">
            <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                  :page-size="tableShow.pageSize" @on-change="changePage"
                  @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
          </div>
        </Card>
      </Col>
    </Row>
    <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
      <p slot="header" style="color:#2d8cf0">
        <Icon type="md-alert"></Icon>
        <span>{{formItem.id ? '编辑' : '新增'}}用户</span>
      </p>
      <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
        <FormItem label="用户账号" prop="username">
          <Input v-model="formItem.username" disabled placeholder="请输入账号" v-if="formItem.id"></Input>
          <Input v-model="formItem.username" placeholder="请输入账号" v-if="!formItem.id"></Input>
          <Tag color="warning" class="margin-left-5">创建后不能修改</Tag>
        </FormItem>
        <FormItem label="用户昵称" prop="nickname">
          <Input v-model="formItem.nickname" placeholder="请输入昵称"></Input>
        </FormItem>
        <FormItem label="用户密码" prop="password">
          <Input v-model="formItem.password" type="password" placeholder="用户密码"></Input>
        </FormItem>
        <FormItem label="用户头像" prop="avatar">
          <div class="demo-upload-list" v-if="formItem.avatar">
            <img :src="formItem.avatar" style="width: 3.125rem;">
            <div class="demo-upload-list-cover">
              <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
            </div>
          </div>
          <input v-if="formItem.image" v-model="formItem.avatar" type="hidden" name="avatar">
          <Upload type="drag"
                  :action="uploadUrl"
                  :headers="uploadHeader"
                  v-if="!formItem.avatar"
                  :format="['jpg','jpeg','png']"
                  :max-size="5120"
                  :on-success="handleImgSuccess"
                  :on-format-error="handleImgFormatError"
                  :on-exceeded-size="handleImgMaxSize"
                  style="display: inline-block;width:58px">
            <div style="width: 58px;height:58px;line-height: 58px">
              <Icon type="md-camera" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <FormItem label="网站名称" prop="web_name" v-if="!formItem.id">
          <Input v-model="formItem.web_name" placeholder="请输入网站名称"></Input>
        </FormItem>
        <FormItem label="网站链接" prop="siteroot" v-if="!formItem.id">
            <Input v-model="formItem.siteroot" placeholder="请输入网站链接"></Input>
        </FormItem>

        <FormItem label="应用组名称" prop="account_name" v-if="!formItem.id">
          <Input v-model="formItem.account_name" placeholder="请输入应用组名称"></Input>
        </FormItem>
        <FormItem label="应用名称" prop="app_name" v-if="!formItem.id">
          <Input v-model="formItem.app_name" placeholder="请输入应用名称"></Input>
        </FormItem>
        <FormItem label="活动名称" prop="activity_name" v-if="!formItem.id">
          <Input v-model="formItem.activity_name" placeholder="请输入活动名称"></Input>
        </FormItem>
        <FormItem label="活动链接" prop="activity_url" v-if="!formItem.id">
          <Input v-model="formItem.activity_url" placeholder="请输入活动链接"></Input>
        </FormItem>
        <FormItem label="活动链接ID" prop="wxapp_rid" v-if="!formItem.id">
          <Input v-model="formItem.wxapp_rid" placeholder="请输入活动链接ID"></Input>
        </FormItem>

        <FormItem label="权限组" prop="group_id">
          <CheckboxGroup v-model="formItem.group_id">
            <Checkbox v-for="group in groupList" :key="group.id" :label="group.id + ''">{{ group.name }}</Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel" class="margin-right-10">取消</Button>
        <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getUserIndex, changeStatus, add, edit, del } from '@/api/user'
import { baseUrl } from '@/libs/api.request'
import { getToken } from '@/libs/util'
import { getGroups } from '@/api/auth'

const editButton = (vm, h, currentRow, index) => {
  if (vm.buttonShow.edit) {
    return h('Button', {
      props: {
        type: 'primary'
      },
      style: {
        margin: '0 5px'
      },
      on: {
        'click': () => {
          vm.formItem.id = currentRow.id
          vm.formItem.username = currentRow.username
          vm.formItem.nickname = currentRow.nickname
          vm.formItem.password = '123456'
          vm.formItem.avatar = currentRow.avatar
          vm.formItem.account_name = currentRow.account_name
          vm.formItem.web_name = currentRow.web_name
          vm.formItem.http = currentRow.http
          vm.formItem.siteroot = currentRow.siteroot

          vm.formItem.app_name = currentRow.app_name
          vm.formItem.activity_name = currentRow.activity_name
          vm.formItem.activity_url = currentRow.activity_url

          getGroups().then(response => {
            vm.groupList = response.data.data.list
          })
          vm.formItem.group_id = currentRow.group_id
          vm.modalSetting.show = true
          vm.modalSetting.index = index
        }
      }
    }, vm.$t('edit_button'))
  }
}
const deleteButton = (vm, h, currentRow, index) => {
  if (vm.buttonShow.del) {
    return h('Poptip', {
      props: {
        confirm: true,
        title: '您确定要删除这条数据吗? ',
        transfer: true
      },
      on: {
        'on-ok': () => {
          del(currentRow.id).then(response => {
            console.log(response)
            vm.tableData.splice(index, 1)
            vm.$Message.success(response.data.msg)
          })
          currentRow.loading = false
        }
      }
    }, [
      h('Button', {
        style: {
          margin: '0 5px',
          display: (currentRow.leavel !== 0) ? '' : 'none'
        },
        props: {
          type: 'error',
          placement: 'top',
          loading: currentRow.isDeleting
        }
      }, vm.$t('delete_button'))
    ])
  }
}

export default {
  name: 'system_user',
  data () {
    return {
      uploadUrl: baseUrl + 'Index/upload',
      uploadHeader: { 'apiAuth': getToken() },
      columnsList: [
        {
          title: 'UID',
          key: 'id',
          width: 100,
          align: 'center',
          sortable: true,
          render: (h, params) => {
            return h('Tag', {
              attrs: {
                color: 'success'
              }
            }, params.row.id)
          }
        },
        {
          title: '用户账号',
          align: 'center',
          key: 'username',
          minWidth: 150,
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', {
                attrs: {
                  span: 8
                }
              }, [
                h('Avatar', {
                  attrs: {
                    src: params.row.avatar,
                    size: 'large'
                  }
                }, params.row.username)
              ]),
              h('Col', {
                attrs: {
                  span: 16
                }
              }, [
                h('Col', {
                  attrs: {
                    style: 'color:#17233d'
                  }
                }, params.row.username),
                h('Col', {
                  attrs: {
                    style: 'color:#808695'
                  }
                }, params.row.nickname)
              ])

            ])
          }
        },
        {
          title: '级别',
          align: 'center',
          key: 'leavel',
          width: 100,
          sortable: true
        },
        {
          title: '请求量',
          align: 'center',
          key: 'hits',
          width: 100,
          sortable: true
        },
        {
          title: '网站',
          align: 'center',
          key: 'num_app_web',
          width: 100,
          sortable: true
        },
        {
          title: '应用组',
          align: 'center',
          key: 'num_app_group',
          width: 100,
          sortable: true
        },
        {
          title: '应用',
          align: 'center',
          key: 'num_app',
          width: 100,
          sortable: true
        },
        {
          title: '接口组',
          align: 'center',
          key: 'num_interface_group',
          width: 100,
          sortable: true
        },
        {
          title: '接口',
          align: 'center',
          key: 'num_interface',
          width: 100,
          sortable: true
        },
        {
          title: '登录次数',
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.userData === null ? '' : params.row.userData.login_times)
          },
          width: 100
        },
        {
          title: '最后登录时间',
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.userData === null ? '' : params.row.userData.last_login_time)
          },
          width: 170
        },
        {
          title: '最后登录IP',
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.userData === null ? '' : params.row.userData.last_login_ip)
          },
          width: 160
        },
        {
          title: '状态',
          align: 'center',
          width: 100,
          fixed: 'right',
          render: (h, params) => {
            let vm = this
            return h('i-switch', {
              attrs: {
                size: 'large'
              },
              props: {
                'true-value': 1,
                'false-value': 0,
                value: params.row.status,
                disabled: !vm.buttonShow.changeStatus
              },
              on: {
                'on-change': function (status) {
                  changeStatus(status, params.row.id).then(response => {
                    vm.$Message.success(response.data.msg)
                    vm.getList()
                  })
                }
              }
            }, [
              h('span', {
                slot: 'open'
              }, vm.$t('open_choose')),
              h('span', {
                slot: 'close'
              }, vm.$t('close_choose'))
            ])
          }
        },
        {
          title: '操作',
          align: 'center',
          width: 200,
          fixed: 'right',
          render: (h, params) => {
            return h('div', [
              editButton(this, h, params.row, params.index),
              deleteButton(this, h, params.row, params.index)
            ])
          }
        }
      ],
      tableData: [],
      groupList: [],
      tableShow: {
        currentPage: 1,
        pageSize: 10,
        listCount: 0
      },
      searchConf: {
        type: '',
        keywords: '',
        status: ''
      },
      modalSetting: {
        show: false,
        loading: false,
        index: 0
      },
      formItem: {
        username: '',
        nickname: '',
        password: '',
        group_id: [],
        avatar: '',
        account_name: '',
        web_name: '',
        http: 1,
        siteroot: '',
        app_name: '',
        activity_name: '',
        activity_url: '',
        wxapp_rid: '',
        id: 0
      },
      ruleValidate: {
        username: [
          { required: true, message: '用户账号不能为空', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' }
        ],
        web_name: [
          { required: true, message: '网站名称不能为空', trigger: 'blur' }
        ],
        siteroot: [
          { required: true, message: '网站链接不能为空', trigger: 'blur' }
        ],
        account_name: [
          { required: true, message: '应用组名称不能为空', trigger: 'blur' }
        ],
        app_name: [
          { required: true, message: '应用名称不能为空', trigger: 'blur' }
        ],
        activity_name: [
          { required: true, message: '活动名称不能为空', trigger: 'blur' }
        ],
        activity_url: [
          { required: true, message: '活动接口链接不能为空', trigger: 'blur' }
        ],
        wxapp_rid: [
          { required: true, message: '活动接口ID不能为空', trigger: 'blur' }
        ]
      },
      buttonShow: {
        edit: true,
        del: true,
        changeStatus: true
      },
      listLoading: false
    }
  },
  created () {
    let vm = this
    vm.getList()
    vm.hasRule('User/edit').then(res => {
      vm.buttonShow.edit = res
    })
    vm.hasRule('User/del').then(res => {
      vm.buttonShow.del = res
    })
    vm.hasRule('User/changeStatus').then(res => {
      vm.buttonShow.changeStatus = res
    })
  },
  methods: {
    alertAdd () {
      let vm = this
      getGroups().then(response => {
        vm.groupList = response.data.data.list
      })
      this.modalSetting.show = true
    },
    submit () {
      let vm = this
      this.$refs['myForm'].validate((valid) => {
        if (valid) {
          vm.modalSetting.loading = true
          if (vm.formItem.id === 0) {
            // vm.formItem.siteroot = (vm.formItem.http === 1) ? 'https://' + vm.formItem.siteroot : 'http://' + vm.formItem.siteroot
            add(vm.formItem).then(response => {
              vm.$Message.success(response.data.msg)
              vm.getList()
              vm.cancel()
            }).catch(() => {
              vm.modalSetting.loading = false
            })
          } else {
            edit(vm.formItem).then(response => {
              vm.$Message.success(response.data.msg)
              vm.getList()
              vm.cancel()
            }).catch(() => {
              vm.modalSetting.loading = false
            })
          }
        }
      })
    },
    cancel () {
      this.modalSetting.show = false
    },
    handleImgFormatError (file) {
      this.$Notice.warning({
        title: '文件类型不合法',
        desc: file.name + '的文件类型不正确，请上传jpg或者png图片。'
      })
    },
    handleImgRemove () {
      this.formItem.avatar = ''
    },
    handleImgSuccess (response) {
      if (response.code === 1) {
        this.$Message.success(response.msg)
        this.formItem.avatar = response.data.fileUrl
      } else {
        this.$Message.error(response.msg)
      }
    },
    handleImgMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小不合法',
        desc: file.name + '太大啦请上传小于5M的文件。'
      })
    },
    doCancel (data) {
      if (!data) {
        this.formItem.id = 0
        this.formItem.avatar = ''
        this.$refs['myForm'].resetFields()
        this.modalSetting.loading = false
        this.modalSetting.index = 0
      }
    },
    changePage (page) {
      this.tableShow.currentPage = page
      this.getList()
    },
    changeSize (size) {
      this.tableShow.pageSize = size
      this.getList()
    },
    search () {
      this.tableShow.currentPage = 1
      this.getList()
    },
    getList () {
      let vm = this
      let params = {
        page: vm.tableShow.currentPage,
        size: vm.tableShow.pageSize,
        type: vm.searchConf.type,
        keywords: vm.searchConf.keywords,
        status: vm.searchConf.status
      }
      vm.listLoading = true
      getUserIndex(params).then(response => {
        vm.tableData = response.data.data.list
        vm.tableShow.listCount = response.data.data.count
        vm.listLoading = false
      })
    }
  }
}
</script>
