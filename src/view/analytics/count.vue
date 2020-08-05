<style scoped>
  @import './count.less';
</style>
<template>
  <div>
    <Row>
      <Col span="24">
        <Card class="margin-bottom-10">
          <Form inline>
            <FormItem class="margin-bottom-0">
              <Select v-model="searchConf.type" clearable placeholder="请选择类别" style="width:120px">
                <Option :value="1">用户昵称</Option>
                <Option :value="2">用户openid</Option>
                <Option :value="3">接口映射</Option>
                <Option :value="4">接口组标识</Option>
                <Option :value="5">应用AppId</Option>
                <Option :value="6">应用组标识</Option>
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
          <div>
            <Table :loading="listLoading" :columns="columnsList" :data="tableData" border disabled-hover></Table>
          </div>
          <div class="margin-top-15" style="text-align: center">
            <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                  :page-size="tableShow.pageSize" @on-change="changePage"
                  @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import { getList } from '@/api/count'
import expandRow from './table_expandCount.vue'
import { getDate } from '@/libs/tools'

export default {
  name: 'system_user',
  components: { expandRow },
  data () {
    return {
      columnsList: [
        {
          title: '',
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: '用户名',
          align: 'center',
          key: 'username',
          width: 150,
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
                }, params.row.openid)
              ])

            ])
          }
        },
        {
          title: 'UUID',
          align: 'center',
          key: 'uuid',
          minWidth: 130
        },
        {
          title: '接口',
          align: 'center',
          key: 'hash',
          width: 200,
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', [
                h('Tag', {
                  attrs: {
                  }
                }, params.row.api_class)

              ]),
              h('Col', [
                h('Tag', {
                  attrs: {
                  }
                }, '映射：  ' + params.row.hash)

              ])
            ])
          }
        },
        {
          title: '来源',
          align: 'center',
          width: 260,
          key: 'platform',
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', [
                h('Tag', {
                  attrs: {
                  }
                }, params.row.type),
                h('Tag', {
                  attrs: {
                  }
                }, params.row.platform),
                h('Tag', {
                  attrs: {
                  }
                }, params.row.system),
                h('Tag', {
                  attrs: {
                  }
                }, params.row.model)

              ]),
              h('Col', [
                h('Tag', {
                  attrs: {
                  }
                }, params.row.from_url)
              ])
            ])
          }
        },
        {
          title: '发送IP/时间',
          align: 'center',
          width: 180,
          key: 'uid',
          sortable: true,
          render: (h, params) => {
            return h('Row', [
              h('Col', [
                h('Tag', {
                  attrs: {
                  }
                }, params.row.create_ip)

              ]),
              h('Col', [
                h('Tag', {
                  attrs: {
                  }
                }, getDate(params.row.create_time, 'year'))

              ])
            ])
          }
        }
      ],
      tableData: [],
      tableShow: {
        currentPage: 1,
        pageSize: 20,
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
      buttonShow: {
        del: true
      },
      listLoading: false
    }
  },
  created (e) {
    let vm = this
    vm.getList()
    vm.hasRule('Count/del').then(res => {
      vm.buttonShow.del = res
    })
  },
  methods: {
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
      console.log(vm)
      let params = {
        hash: vm.$route.query.hash || '',
        group_hash: vm.$route.query.group_hash || '',
        page: vm.tableShow.currentPage,
        size: vm.tableShow.pageSize,
        type: vm.searchConf.type,
        keywords: vm.searchConf.keywords
      }
      vm.listLoading = true
      getList(params).then(response => {
        vm.tableData = response.data.data.list
        vm.tableShow.listCount = response.data.data.count
        vm.listLoading = false
      })
    }
  }
}
</script>
