<style lang="less" scoped>
  @import './list.less';
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
                <Option :value="1">接口组名称</Option>
                <Option :value="2">接口名称</Option>
                <Option :value="3">真实类库</Option>
              </Select>
            </FormItem>
            <FormItem class="margin-bottom-0" v-if="searchConf.type == 1">
              <Select v-model="searchConf.keywords" clearable placeholder="请选择接口组" style="width:120px">
                <Option v-for="(v, i) in apiGroup" :value="v.hash" :kk="i" :key="v.hash"> {{v.name}}</Option>
              </Select>
            </FormItem>

            <FormItem class="margin-bottom-0">
              <Input v-model="searchConf.keywords" clearable placeholder=""></Input>
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
            <Button type="primary" v-has="'InterfaceList/add'" @click="alertAdd" icon="md-add">{{ $t('add_button') }}</Button>
            <Button type="warning" v-has="'InterfaceList/refresh'" class="margin-left-5" @click="confirmRefresh = true" icon="md-refresh">刷新路由</Button>
            <Button type="info" class="margin-left-5" to="/wiki/list" icon="md-bookmarks">接口文档</Button>
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
        <span>{{formItem.id ? '编辑' : '新增'}}接口</span>
      </p>
      <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="90">
        <FormItem label="接口名称" prop="info">
          <Input v-model="formItem.info" placeholder="请输入接口名称"></Input>
        </FormItem>
        <FormItem label="真实类库" prop="api_class">
          <Input v-model="formItem.api_class" placeholder="请输入真实类库"></Input>
        </FormItem>
        <FormItem label="接口分组" prop="group_hash">
          <Select v-model="formItem.group_hash" style="width:200px">
            <Option v-for="(v, i) in apiUserGroup" :value="v.hash" :kk="i" :key="v.hash"> {{v.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="请求方式" prop="method">
          <Select v-model="formItem.method" style="width:200px">
            <Option :value="0" :key="0"> 不限</Option>
            <Option :value="1" :key="1"> POST</Option>
            <Option :value="2" :key="2"> GET</Option>
          </Select>
        </FormItem>
        <FormItem label="接口映射" prop="hash">
          <Input style="width: 300px" disabled v-model="formItem.hash"></Input>
          <Tag color="error" class="margin-left-5">系统自动生成，不允许修改</Tag>
        </FormItem>
        <FormItem label="AccessToken" prop="access_token">
          <Select v-model="formItem.access_token" style="width:200px">
            <Option :value="0" :key="0"> 简易认证</Option>
            <Option :value="1" :key="1"> 复杂认证</Option>
          </Select>
          <Tooltip placement="right" max-width="800">
            <Icon type="md-help-circle" class="margin-left-5" color="#2d8cf0" size="20"/>
            <div slot="content">
              <p>新版本的全部接口都必须在Header中传递access-token字段，所以AccessToken必须要验证。</p>
              <p>简易认证：在请求这类接口时候，请直接在header中传递AppSecret即可，终身有效。</p>
              <p>复杂认证：在请求这类接口时候，先请求getAccessToken接口获取可用的AccessToken，记住这里的AccessToken默认只有2小时的有效期。</p>
            </div>
          </Tooltip>
        </FormItem>
        <FormItem label="路由模式" prop="hash_type">
          <Select v-model="formItem.hash_type" style="width:200px">
            <Option :value="1" :key="1"> 普通模式</Option>
            <Option :value="2" :key="2"> 加密模式</Option>
          </Select>
          <Tooltip placement="right" max-width="800">
            <Icon type="md-help-circle" class="margin-left-5" color="#2d8cf0" size="20"/>
            <div slot="content">
              <p>普通模式：接口将不采用hash映射，会直接使用真实类库来请求。</p>
              <p>加密模式：接口将采用hash映射，以达到隐藏真实类库的目的。</p>
            </div>
          </Tooltip>
        </FormItem>
        <FormItem label="测试模式" prop="is_test">
          <Select v-model="formItem.is_test" style="width:200px">
            <Option :value="0" :key="0"> 生产模式</Option>
            <Option :value="1" :key="1"> 测试模式</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancel" class="margin-right-10">取消</Button>
        <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
      </div>
    </Modal>
    <Modal v-model="confirmRefresh" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="information-circled"></Icon>
        <span>确定要刷新路由么</span>
      </p>
      <div style="text-align:center">
        <p>刷新路由是一个非常危险的操作，它有可能影响到您现有接口的访问，请确认无误后刷新！！</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long  :loading="refreshLoading" @click="refreshRoute">确定刷新</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getList, changeStatus, add, edit, del, getHash, refresh } from '@/api/interface'
import { getAll } from '@/api/interface-group'

const editButton = (vm, h, currentRow, index) => {
  if (vm.buttonShow.edit) {
    return h('Button', {
      props: {

      },
      on: {
        'click': () => {
          vm.formItem.id = currentRow.id
          vm.formItem.uid = currentRow.uid
          vm.formItem.api_class = currentRow.api_class
          vm.formItem.info = currentRow.info
          vm.formItem.method = currentRow.method
          vm.formItem.hash = currentRow.hash
          vm.formItem.group_hash = currentRow.group_hash
          vm.formItem.access_token = currentRow.access_token
          vm.formItem.is_test = currentRow.is_test
          vm.formItem.hash_type = currentRow.hash_type
          vm.modalSetting.show = true
          vm.modalSetting.index = index
          getAll(currentRow.uid).then(response => {
            vm.apiUserGroup = response.data.data.list
          })
        }
      }
    }, vm.$t('edit_button'))
  }
}
const deleteButton = (vm, h, currentRow, index) => {
  if (vm.buttonShow.del) {
    return h('Button', {
      props: {
        type: 'error',
        placement: 'top',
        loading: currentRow.isDeleting
      }
    }, [
      h('Poptip', {
        props: {
          confirm: true,
          title: '您确定要删除这条数据吗? ',
          transfer: true
        },
        on: {
          'on-ok': () => {
            del(currentRow.hash).then(response => {
              currentRow.loading = false
              vm.tableData.splice(index, 1)
              vm.$Message.success(response.data.msg)
            })
          }
        }
      }, vm.$t('delete_button'))
    ])
  }
}
const requestButton = (vm, h, currentRow, index) => {
  if (vm.buttonShow.request) {
    return h('Button', {
      style: {
      },
      props: {
        placement: 'top',
        loading: currentRow.isDeleting
      },
      on: {
        click: () => {
          let hash = currentRow.hash
          vm.$router.push({
            path: `request/${hash}`
          })
        }
      }
    }, '请求参数')
  }
}
const responseButton = (vm, h, currentRow, index) => {
  if (vm.buttonShow.response) {
    return h('Button', {
      style: {
      },
      props: {
        placement: 'top',
        loading: currentRow.isDeleting
      },
      on: {
        click: () => {
          let hash = currentRow.hash
          vm.$router.push({
            path: `response/${hash}`
          })
        }
      }
    }, '返回参数')
  }
}
const countPostList = (vm, h, currentRow, index) => {
  if (vm.buttonShow.countPostList) {
    return h('Button', {
      style: {
      },
      props: {
        shape: 'circle',
        size: 'small',
        type: 'warning',
        placement: 'top',
        loading: currentRow.isDeleting
      },
      on: {
        click: () => {
          let hash = currentRow.hash
          vm.$router.push({
            path: `/analytics/count?hash=${hash}`
          })
        }
      }
    }, currentRow.hits)
  }
}

export default {
  name: 'interface_list',
  data () {
    return {
      confirmRefresh: false,
      refreshLoading: false,
      columnsList: [
        /** {
          title: '序号',
          type: 'index',
          width: 100,
          align: 'center',
          sortable: true
        },**/
        {
          title: '接口名称',
          align: 'center',
          minWidth: 190,
          key: 'info'
        },
        {
          title: '真实类库',
          align: 'center',
          width: 190,
          key: 'api_class',
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', params.row.api_class),
              h('Col', [
                h('Tag', '映射: ' + params.row.hash)
              ])
            ])
          }
        },
        {
          title: '请求量',
          align: 'center',
          key: 'hits',
          width: 100,
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              countPostList(this, h, params.row, params.index)
            ])
          }
        },
        {
          title: '接口组',
          align: 'center',
          width: 180,
          key: 'group_hash',
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', params.row.group_name),
              h('Col', [
                h('Tag', params.row.group_hash)
              ])
            ])
          }
        },
        {
          title: '所属用户',
          align: 'center',
          width: 150,
          key: 'uid',
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', params.row.username),
              h('Col', [
                h('Tag', {
                  attrs: {
                    color: 'warning'
                  }
                }, params.row.uid)

              ])
            ])
          }
        },
        {
          title: '请求方式',
          align: 'center',
          width: 95,
          render: (h, params) => {
            if (params.row.isTest === 1) {
              return h('tag', {
                attrs: {
                  color: 'error'
                }
              }, '测试')
            } else {
              switch (params.row.method) {
                case 1:
                  return h('Tag', {
                    attrs: {
                      color: 'success'
                    }
                  }, 'POST')
                case 2:
                  return h('Tag', {
                    attrs: {
                      color: 'primary'
                    }
                  }, 'GET')
                case 0:
                  return h('Tag', {
                    attrs: {
                      color: 'warning'
                    }
                  }, '不限')
              }
            }
          }
        },
        {
          title: '接口状态',
          align: 'center',
          width: 130,
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
                  changeStatus(status, params.row.hash).then(response => {
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
          align: 'left',
          width: 330,
          fixed: 'right',
          render: (h, params) => {
            return h('Row', [
              h('Col', {
                attrs: {
                  style: 'margin:10px 0 5px 0'
                }
              }, [
                h('ButtonGroup', {
                  attrs: {
                    shape: 'circle'
                  }
                }, [
                  editButton(this, h, params.row, params.index),
                  responseButton(this, h, params.row, params.index),
                  requestButton(this, h, params.row, params.index),
                  deleteButton(this, h, params.row, params.index)
                ])
              ])
            ])
          }
        }
      ],
      tableData: [],
      apiGroup: [],
      apiUserGroup: [],
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
        api_class: '',
        info: '',
        group_hash: 'default',
        method: 2,
        hash_type: 2,
        hash: '',
        access_token: 0,
        is_test: 0,
        id: 0,
        uid: 0
      },
      ruleValidate: {
        api_class: [
          { required: true, message: '真实类库不能为空', trigger: 'blur' }
        ],
        info: [
          { required: true, message: '接口名称不能为空', trigger: 'blur' }
        ]
      },
      buttonShow: {
        edit: true,
        request: true,
        response: true,
        del: true,
        changeStatus: true,
        countPostList: true
      },
      listLoading: false
    }
  },
  created () {
    let vm = this
    vm.getList()
    vm.hasRule('InterfaceList/edit').then(res => {
      vm.buttonShow.edit = res
    })
    vm.hasRule('InterfaceList/del').then(res => {
      vm.buttonShow.del = res
    })
    vm.hasRule('InterfaceList/changeStatus').then(res => {
      vm.buttonShow.changeStatus = res
    })
    vm.hasRule('Fields/response').then(res => {
      vm.buttonShow.response = res
    })
    vm.hasRule('Fields/request').then(res => {
      vm.buttonShow.request = res
    })
    getAll(vm.formItem.uid).then(response => {
      vm.apiGroup = response.data.data.list
    })
  },
  activated () {
    let vm = this
    getAll(vm.formItem.uid).then(response => {
      vm.apiGroup = response.data.data.list
    })
  },
  methods: {
    alertAdd () {
      let vm = this
      getAll(0).then(response => {
        vm.apiUserGroup = response.data.data.list
      })
      getHash().then(response => {
        vm.formItem.hash = response.data.data.hash
      })
      vm.modalSetting.show = true
    },
    submit () {
      let vm = this
      this.$refs['myForm'].validate((valid) => {
        if (valid) {
          vm.modalSetting.loading = true
          if (vm.formItem.id === 0) {
            add(vm.formItem).then(response => {
              vm.modalSetting.loading = false
              vm.$Message.success(response.data.msg)
              vm.getList()
              vm.cancel()
            }).catch(() => {
              vm.modalSetting.loading = false
            })
          } else {
            edit(vm.formItem).then(response => {
              vm.modalSetting.loading = false
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
    searchnull () {
      this.searchConf.keywords = ''
    },
    getList () {
      let vm = this
      vm.listLoading = true
      getList({
        page: vm.tableShow.currentPage,
        size: vm.tableShow.pageSize,
        type: vm.searchConf.type,
        keywords: vm.searchConf.keywords,
        status: vm.searchConf.status
      }).then(response => {
        vm.tableData = response.data.data.list
        vm.tableShow.listCount = response.data.data.count
        vm.listLoading = false
      })
    },
    doCancel (data) {
      if (!data) {
        this.formItem.id = 0
        this.$refs['myForm'].resetFields()
        this.modalSetting.loading = false
        this.modalSetting.index = 0
      }
    },
    refreshRoute () {
      let vm = this
      vm.refreshLoading = true
      refresh().then(response => {
        vm.$Message.success(response.data.msg)
        vm.confirmRefresh = false
        vm.refreshLoading = false
      }).catch(() => {
        vm.confirmRefresh = false
        vm.refreshLoading = false
      })
    }
  }
}
</script>
